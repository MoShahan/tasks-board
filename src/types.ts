import type { Priority, Status } from "./constants";

export type Board = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  boardId: string;
  status: Status;
  priority: Priority;
  dueDate: Date;
  completedAt: Date | null;
};

export type TaskDraft = Omit<Task, "id">;

export type TaskFilters = {
  search: string;
  priority: Priority | "all";
};

export type SortDirection = "asc" | "desc";

export type ViewMode = "board" | "list";

export type ListSortKey = "title" | "board" | "status" | "priority" | "dueDate";

export type DragKind = "task" | "board";
