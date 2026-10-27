import { DEFAULT_BOARDS } from "../constants";
import type { Board, Task } from "../types";

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

export const demoBoards: Board[] = DEFAULT_BOARDS.map((board) => ({ ...board }));

export const demoTasks: Task[] = [
  {
    id: "task-api-contract",
    title: "Write API contract",
    description:
      "Document request and response shapes for the tasks endpoints before frontend integration.",
    boardId: "board-pending",
    status: "open",
    priority: "high",
    dueDate: daysFromNow(2),
    completedAt: null,
  },
  {
    id: "task-login-expiry",
    title: "Fix login token expiry",
    description:
      "Refresh tokens expire too early on mobile. Align TTL with the auth service config.",
    boardId: "board-in-progress",
    status: "open",
    priority: "high",
    dueDate: daysFromNow(1),
    completedAt: null,
  },
  {
    id: "task-empty-states",
    title: "Design empty states",
    description:
      "Add illustrations and copy for filtered boards with no matching tasks.",
    boardId: "board-pending",
    status: "open",
    priority: "medium",
    dueDate: daysFromNow(5),
    completedAt: null,
  },
  {
    id: "task-filter-qa",
    title: "QA search and filters",
    description:
      "Walk through status, priority, and title search combinations on staging.",
    boardId: "board-in-progress",
    status: "open",
    priority: "medium",
    dueDate: daysFromNow(3),
    completedAt: null,
  },
  {
    id: "task-readme",
    title: "Update onboarding README",
    description:
      "List local setup, lint, and test commands so new engineers can run the app on day one.",
    boardId: "board-completed",
    status: "completed",
    priority: "low",
    dueDate: daysFromNow(-4),
    completedAt: daysFromNow(-3),
  },
  {
    id: "task-a11y-pass",
    title: "Accessibility pass on modal",
    description:
      "Ensure the create/edit dialog traps focus, labels every field, and closes on Escape.",
    boardId: "board-pending",
    status: "open",
    priority: "high",
    dueDate: daysFromNow(7),
    completedAt: null,
  },
  {
    id: "task-seed-data",
    title: "Seed demo workspace",
    description:
      "Load a realistic set of tasks with staggered due dates for the product walkthrough.",
    boardId: "board-completed",
    status: "completed",
    priority: "medium",
    dueDate: daysFromNow(-1),
    completedAt: daysFromNow(0),
  },
  {
    id: "task-sort-due-date",
    title: "Verify due date sorting",
    description:
      "Confirm ascending and descending sort keeps overdue work at the expected end of each column.",
    boardId: "board-in-progress",
    status: "open",
    priority: "low",
    dueDate: daysFromNow(9),
    completedAt: null,
  },
];
