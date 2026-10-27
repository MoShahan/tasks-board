import type { Task } from "../types";

import {
  addBoard,
  deleteBoard,
  insertBoard,
  moveBoard,
  nextBoardName,
  renameBoard,
  validateBoardName,
} from "./boards";

const boards = [
  { id: "a", name: "Pending" },
  { id: "b", name: "In Progress" },
  { id: "c", name: "Completed" },
];

const tasks: Task[] = [
  {
    id: "1",
    title: "Task",
    description: "",
    boardId: "a",
    status: "open",
    priority: "low",
    dueDate: new Date("2026-09-20T12:00:00"),
    completedAt: null,
  },
];

describe("board helpers", () => {
  it("rejects an empty board name", () => {
    expect(validateBoardName("")).toBe("Board name is required.");
    expect(validateBoardName(" Backlog ")).toBeNull();
  });

  it("creates unique default names", () => {
    expect(nextBoardName(boards)).toBe("New board");
    expect(nextBoardName([...boards, { id: "d", name: "New board" }])).toBe(
      "New board 2",
    );
  });

  it("adds, renames, and reorders boards", () => {
    const added = addBoard(boards, "Review", "d");
    const renamed = renameBoard(added, "d", "QA");
    const reordered = moveBoard(renamed, "d", "a", "before");

    expect(added.at(-1)).toEqual({ id: "d", name: "Review" });
    expect(renamed.at(-1)?.name).toBe("QA");
    expect(reordered.map((board) => board.id)).toEqual(["d", "a", "b", "c"]);
  });

  it("only deletes an empty board and never the last one", () => {
    expect(deleteBoard(boards, tasks, "a")).toBeNull();

    const removed = deleteBoard(boards, tasks, "b");
    expect(removed?.boards.map((board) => board.id)).toEqual(["a", "c"]);
    expect(removed?.tasks[0].boardId).toBe("a");
    expect(deleteBoard([{ id: "a", name: "Only" }], [], "a")).toBeNull();
  });

  it("inserts a board back at the original index", () => {
    const board = boards[1];
    const without = boards.filter((item) => item.id !== "b");
    const restored = insertBoard(without, board, 1);

    expect(restored.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
