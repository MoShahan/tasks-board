import type { Board } from "./types";

export const STATUS_VALUES = ["open", "completed"] as const;
export type Status = (typeof STATUS_VALUES)[number];

export const PRIORITY_VALUES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITY_VALUES)[number];

export const STATUS_LABELS: Record<Status | "all", string> = {
  all: "All statuses",
  open: "Open",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<Priority | "all", string> = {
  all: "All priorities",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const DEFAULT_BOARDS: Board[] = [
  { id: "board-pending", name: "Todo" },
  { id: "board-in-progress", name: "Progress" },
  { id: "board-completed", name: "Done" },
];

export const STORAGE_KEY = "tasks-board";
