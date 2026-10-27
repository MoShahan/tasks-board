import { DEFAULT_BOARDS } from "../constants";
import type {
  Board,
  ListSortKey,
  SortDirection,
  Task,
  TaskDraft,
  TaskFilters,
} from "../types";

const LEGACY_STATUS_TO_BOARD: Record<string, string> = {
  pending: "board-pending",
  "in-progress": "board-in-progress",
  completed: "board-completed",
};

export function validateTaskTitle(title: string): string | null {
  if (!title.trim()) {
    return "Title is required.";
  }

  return null;
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  hideCompleted = false,
): Task[] {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      search.length === 0 || task.title.toLowerCase().includes(search);
    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;
    const matchesVisibility = !hideCompleted || task.status !== "completed";

    return matchesSearch && matchesPriority && matchesVisibility;
  });
}

export function sortTasks(tasks: Task[], direction: SortDirection): Task[] {
  return [...tasks].sort((a, b) => {
    const diff = a.dueDate.getTime() - b.dueDate.getTime();
    return direction === "asc" ? diff : -diff;
  });
}

export function getVisibleTasks(
  tasks: Task[],
  filters: TaskFilters,
  direction: SortDirection,
  hideCompleted = false,
): Task[] {
  return sortTasks(filterTasks(tasks, filters, hideCompleted), direction);
}

export function addTask(tasks: Task[], draft: TaskDraft, id?: string): Task[] {
  const status = draft.status;
  return [
    ...tasks,
    {
      ...draft,
      id: id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      status,
      completedAt:
        status === "completed"
          ? (draft.completedAt ?? new Date())
          : null,
    },
  ];
}

export function updateTask(
  tasks: Task[],
  taskId: string,
  updates: Partial<TaskDraft>,
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    const next: Task = {
      ...task,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : task.title,
    };

    if (next.status === "open") {
      next.completedAt = null;
    } else if (next.status === "completed" && !next.completedAt) {
      next.completedAt = new Date();
    }

    return next;
  });
}

export function completeTask(
  tasks: Task[],
  taskId: string,
  completedAt = new Date(),
): Task[] {
  return tasks.map((task) =>
    task.id === taskId
      ? { ...task, status: "completed", completedAt }
      : task,
  );
}

export function uncompleteTask(tasks: Task[], taskId: string): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, status: "open", completedAt: null } : task,
  );
}

export function deleteTask(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.id !== taskId);
}

export function insertTask(tasks: Task[], task: Task, index: number): Task[] {
  const next = [...tasks];
  const insertAt = Math.min(Math.max(index, 0), next.length);
  next.splice(insertAt, 0, task);
  return next;
}

export function duplicateTask(tasks: Task[], taskId: string, id?: string): Task[] {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return tasks;
  }

  const original = tasks[index];
  const copy: Task = {
    ...original,
    id: id ?? crypto.randomUUID(),
    title: `${original.title} (copy)`,
  };
  const next = [...tasks];
  next.splice(index + 1, 0, copy);
  return next;
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 } as const;
const STATUS_RANK = {
  open: 0,
  completed: 1,
} as const;

export function sortTasksBy(
  tasks: Task[],
  key: ListSortKey,
  direction: SortDirection,
  boards: Board[] = [],
): Task[] {
  const boardNames = new Map(boards.map((board) => [board.id, board.name]));

  return [...tasks].sort((a, b) => {
    let diff = 0;

    switch (key) {
      case "title":
        diff = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        break;
      case "board":
        diff = (boardNames.get(a.boardId) ?? "").localeCompare(
          boardNames.get(b.boardId) ?? "",
          undefined,
          { sensitivity: "base" },
        );
        break;
      case "status":
        diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        break;
      case "priority":
        diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        break;
      case "dueDate":
        diff = a.dueDate.getTime() - b.dueDate.getTime();
        break;
    }

    return direction === "asc" ? diff : -diff;
  });
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDueDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCompletedOn(date: Date): string {
  return `Completed on ${formatDueDate(date)}`;
}

export function isOverdue(task: Task, now = new Date()): boolean {
  if (task.status === "completed") {
    return false;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

type SerializedTask = Omit<Task, "dueDate" | "completedAt"> & {
  dueDate: string;
  completedAt: string | null;
};

type StorePayloadV2 = {
  version: 2;
  boards: Board[];
  tasks: SerializedTask[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeBoard(value: unknown): Board | null {
  const item = asRecord(value);
  if (!item || typeof item.id !== "string" || typeof item.name !== "string") {
    return null;
  }

  const name = item.name.trim();
  if (!item.id || !name) {
    return null;
  }

  return { id: item.id, name };
}

function normalizeTask(value: unknown, fallbackBoardId: string): Task | null {
  const item = asRecord(value);
  if (
    !item ||
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.description !== "string" ||
    typeof item.priority !== "string" ||
    typeof item.dueDate !== "string"
  ) {
    return null;
  }

  const legacyStatus =
    typeof item.status === "string" ? item.status : undefined;
  const boardId =
    typeof item.boardId === "string" && item.boardId
      ? item.boardId
      : (legacyStatus && LEGACY_STATUS_TO_BOARD[legacyStatus]) || fallbackBoardId;
  const status = legacyStatus === "completed" ? "completed" : "open";
  const dueDate = new Date(item.dueDate);
  const completedAt =
    status === "completed"
      ? typeof item.completedAt === "string" && item.completedAt
        ? new Date(item.completedAt)
        : dueDate
      : null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    boardId,
    status,
    priority: item.priority as Task["priority"],
    dueDate,
    completedAt,
  };
}

const LEGACY_DEFAULT_BOARD_NAMES: Record<string, string> = {
  "board-pending": "Pending",
  "board-in-progress": "In Progress",
  "board-completed": "Completed",
};

function refreshDefaultBoardNames(boards: Board[]): Board[] {
  const defaults = new Map(DEFAULT_BOARDS.map((board) => [board.id, board.name]));

  return boards.map((board) => {
    const nextName = defaults.get(board.id);
    if (nextName && board.name === LEGACY_DEFAULT_BOARD_NAMES[board.id]) {
      return { ...board, name: nextName };
    }

    return board;
  });
}

function withValidBoardIds(boards: Board[], tasks: Task[]): Task[] {
  const boardIds = new Set(boards.map((board) => board.id));
  const fallback = boards[0]?.id;

  if (!fallback) {
    return tasks;
  }

  return tasks.map((task) =>
    boardIds.has(task.boardId) ? task : { ...task, boardId: fallback },
  );
}

export function serializeTasks(tasks: Task[]): string {
  const payload: SerializedTask[] = tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  }));
  return JSON.stringify(payload);
}

export function deserializeTasks(raw: string): Task[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const fallback = DEFAULT_BOARDS[0].id;
    const tasks = parsed
      .map((item) => normalizeTask(item, fallback))
      .filter((task): task is Task => task !== null);

    return tasks;
  } catch {
    return null;
  }
}

export function serializeStore(boards: Board[], tasks: Task[]): string {
  const payload: StorePayloadV2 = {
    version: 2,
    boards,
    tasks: tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate.toISOString(),
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    })),
  };
  return JSON.stringify(payload);
}

export function deserializeStore(
  raw: string,
): { boards: Board[]; tasks: Task[] } | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const boards = DEFAULT_BOARDS.map((board) => ({ ...board }));
      const tasks = parsed
        .map((item) => normalizeTask(item, boards[0].id))
        .filter((task): task is Task => task !== null);

      return { boards, tasks: withValidBoardIds(boards, tasks) };
    }

    const payload = asRecord(parsed);
    if (
      !payload ||
      payload.version !== 2 ||
      !Array.isArray(payload.boards) ||
      !Array.isArray(payload.tasks)
    ) {
      return null;
    }

    const boards = payload.boards
      .map(normalizeBoard)
      .filter((board): board is Board => board !== null);
    const nextBoards = refreshDefaultBoardNames(
      boards.length > 0 ? boards : DEFAULT_BOARDS.map((board) => ({ ...board })),
    );
    const tasks = payload.tasks
      .map((item) => normalizeTask(item, nextBoards[0].id))
      .filter((task): task is Task => task !== null);

    return { boards: nextBoards, tasks: withValidBoardIds(nextBoards, tasks) };
  } catch {
    return null;
  }
}
