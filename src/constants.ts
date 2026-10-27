export const STATUS_VALUES = ["pending", "in-progress", "completed"] as const;
export type Status = (typeof STATUS_VALUES)[number];

export const PRIORITY_VALUES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITY_VALUES)[number];

export const STATUS_LABELS: Record<Status | "all", string> = {
  all: "All statuses",
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<Priority | "all", string> = {
  all: "All priorities",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const STORAGE_KEY = "tasks-board";
