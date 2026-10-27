import type { Board, Task } from "../types";

export function validateBoardName(name: string): string | null {
  if (!name.trim()) {
    return "Board name is required.";
  }

  return null;
}

export function nextBoardName(boards: Board[]): string {
  const base = "New board";
  const taken = new Set(boards.map((board) => board.name.toLowerCase()));

  if (!taken.has(base.toLowerCase())) {
    return base;
  }

  let index = 2;
  while (taken.has(`${base} ${index}`.toLowerCase())) {
    index += 1;
  }

  return `${base} ${index}`;
}

export function addBoard(boards: Board[], name: string, id?: string): Board[] {
  return [...boards, { id: id ?? crypto.randomUUID(), name: name.trim() }];
}

export function renameBoard(
  boards: Board[],
  boardId: string,
  name: string,
): Board[] {
  const nextName = name.trim();

  return boards.map((board) =>
    board.id === boardId ? { ...board, name: nextName } : board,
  );
}

export function moveBoard(
  boards: Board[],
  boardId: string,
  targetBoardId: string,
  place: "before" | "after",
): Board[] {
  if (boardId === targetBoardId) {
    return boards;
  }

  const moving = boards.find((board) => board.id === boardId);
  if (!moving) {
    return boards;
  }

  const without = boards.filter((board) => board.id !== boardId);
  const targetIndex = without.findIndex((board) => board.id === targetBoardId);
  if (targetIndex === -1) {
    return boards;
  }

  const insertAt = place === "before" ? targetIndex : targetIndex + 1;
  const next = [...without];
  next.splice(insertAt, 0, moving);
  return next;
}

export function deleteBoard(
  boards: Board[],
  tasks: Task[],
  boardId: string,
): { boards: Board[]; tasks: Task[] } | null {
  if (boards.length <= 1) {
    return null;
  }

  const index = boards.findIndex((board) => board.id === boardId);
  if (index === -1) {
    return null;
  }

  if (tasks.some((task) => task.boardId === boardId)) {
    return null;
  }

  return {
    boards: boards.filter((board) => board.id !== boardId),
    tasks,
  };
}

export function insertBoard(
  boards: Board[],
  board: Board,
  index: number,
): Board[] {
  if (boards.some((item) => item.id === board.id)) {
    return boards;
  }

  const next = [...boards];
  const insertAt = Math.min(Math.max(index, 0), next.length);
  next.splice(insertAt, 0, board);
  return next;
}

export function boardNameById(boards: Board[], boardId: string): string {
  return boards.find((board) => board.id === boardId)?.name ?? "Unknown board";
}
