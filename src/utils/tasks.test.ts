import { DEFAULT_BOARDS } from "../constants";
import type { Task } from "../types";

import {
  addTask,
  completeTask,
  deleteTask,
  deserializeStore,
  deserializeTasks,
  duplicateTask,
  filterTasks,
  insertTask,
  serializeTasks,
  sortTasks,
  sortTasksBy,
  uncompleteTask,
  updateTask,
  validateTaskTitle,
} from "./tasks";

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Write API contract",
    description: "Document endpoints",
    boardId: "board-pending",
    status: "open",
    priority: "high",
    dueDate: new Date("2026-09-20T12:00:00"),
    completedAt: null,
  },
  {
    id: "2",
    title: "Fix login token expiry",
    description: "Auth TTL",
    boardId: "board-in-progress",
    status: "open",
    priority: "high",
    dueDate: new Date("2026-09-18T12:00:00"),
    completedAt: null,
  },
  {
    id: "3",
    title: "Update onboarding README",
    description: "Docs",
    boardId: "board-completed",
    status: "completed",
    priority: "low",
    dueDate: new Date("2026-09-10T12:00:00"),
    completedAt: new Date("2026-09-11T12:00:00"),
  },
];

describe("validateTaskTitle", () => {
  it("rejects empty or whitespace titles", () => {
    expect(validateTaskTitle("")).toBe("Title is required.");
    expect(validateTaskTitle("   ")).toBe("Title is required.");
  });

  it("accepts a non-empty title", () => {
    expect(validateTaskTitle("Ship filters")).toBeNull();
  });
});

describe("filterTasks", () => {
  it("searches by title only", () => {
    const result = filterTasks(sampleTasks, {
      search: "login",
      priority: "all",
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Fix login token expiry");
  });

  it("does not match description text", () => {
    const result = filterTasks(sampleTasks, {
      search: "Document",
      priority: "all",
    });

    expect(result).toHaveLength(0);
  });

  it("filters by priority", () => {
    const result = filterTasks(sampleTasks, {
      search: "",
      priority: "high",
    });

    expect(result.map((task) => task.id)).toEqual(["1", "2"]);
  });

  it("hides completed tasks when requested", () => {
    const result = filterTasks(
      sampleTasks,
      { search: "", priority: "all" },
      true,
    );

    expect(result.map((task) => task.id)).toEqual(["1", "2"]);
  });
});

describe("sortTasks", () => {
  it("sorts by due date without mutating the original array", () => {
    const originalOrder = sampleTasks.map((task) => task.id);
    const ascending = sortTasks(sampleTasks, "asc");
    const descending = sortTasks(sampleTasks, "desc");

    expect(ascending.map((task) => task.id)).toEqual(["3", "2", "1"]);
    expect(descending.map((task) => task.id)).toEqual(["1", "2", "3"]);
    expect(sampleTasks.map((task) => task.id)).toEqual(originalOrder);
  });
});

describe("task mutations", () => {
  it("adds a task with a generated id", () => {
    const next = addTask(sampleTasks, {
      title: "New board column",
      description: "",
      boardId: "board-pending",
      status: "open",
      priority: "medium",
      dueDate: new Date("2026-09-22T12:00:00"),
      completedAt: null,
    }, "task-new");

    expect(next).toHaveLength(4);
    expect(next[3].id).toBe("task-new");
    expect(next[3].title).toBe("New board column");
  });

  it("updates and completes a task without moving its board", () => {
    const updated = updateTask(sampleTasks, "1", { title: "Write OpenAPI spec" });
    const completed = completeTask(updated, "1");

    expect(sampleTasks[0].title).toBe("Write API contract");
    expect(updated[0].title).toBe("Write OpenAPI spec");
    expect(completed[0].status).toBe("completed");
    expect(completed[0].boardId).toBe("board-pending");
    expect(completed[0].completedAt).toBeInstanceOf(Date);
  });

  it("marks a completed task as open again", () => {
    const next = uncompleteTask(sampleTasks, "3");
    expect(next[2].status).toBe("open");
    expect(next[2].boardId).toBe("board-completed");
    expect(next[2].completedAt).toBeNull();
  });

  it("deletes a task by id", () => {
    const next = deleteTask(sampleTasks, "2");
    expect(next.map((task) => task.id)).toEqual(["1", "3"]);
  });

  it("duplicates a task after the original", () => {
    const next = duplicateTask(sampleTasks, "1", "1-copy");

    expect(next.map((task) => task.id)).toEqual(["1", "1-copy", "2", "3"]);
    expect(next[1].title).toBe("Write API contract (copy)");
    expect(sampleTasks).toHaveLength(3);
  });

  it("inserts a task back at the original index", () => {
    const removed = sampleTasks[1];
    const without = deleteTask(sampleTasks, "2");
    const restored = insertTask(without, removed, 1);

    expect(restored.map((task) => task.id)).toEqual(["1", "2", "3"]);
  });
});

describe("sortTasksBy", () => {
  it("sorts by title and priority", () => {
    const byTitle = sortTasksBy(sampleTasks, "title", "asc");
    const byPriority = sortTasksBy(sampleTasks, "priority", "desc");

    expect(byTitle.map((task) => task.id)).toEqual(["2", "3", "1"]);
    expect(byPriority[0].priority).toBe("high");
  });
});

describe("serialization", () => {
  it("round-trips dates through JSON", () => {
    const restored = deserializeTasks(serializeTasks(sampleTasks));

    expect(restored).not.toBeNull();
    expect(restored![1].dueDate).toBeInstanceOf(Date);
    expect(restored![1].title).toBe("Fix login token expiry");
  });

  it("migrates a legacy task array onto default boards", () => {
    const restored = deserializeStore(
      JSON.stringify([
        {
          id: "legacy-1",
          title: "Old pending task",
          description: "",
          status: "pending",
          priority: "medium",
          dueDate: "2026-09-20T12:00:00.000Z",
        },
        {
          id: "legacy-2",
          title: "Old done task",
          description: "",
          status: "completed",
          priority: "low",
          dueDate: "2026-09-10T12:00:00.000Z",
        },
      ]),
    );

    expect(restored).not.toBeNull();
    expect(restored!.boards.map((board) => board.name)).toEqual(
      DEFAULT_BOARDS.map((board) => board.name),
    );
    expect(restored!.tasks[0]).toMatchObject({
      boardId: "board-pending",
      status: "open",
    });
    expect(restored!.tasks[1]).toMatchObject({
      boardId: "board-completed",
      status: "completed",
    });
  });
});
