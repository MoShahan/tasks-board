# Tasks Board

A dark-themed task board for creating, editing, completing, and filtering work across Pending, In Progress, and Completed columns. Drag a card from one column to another to move it and update its status.

Live site: [https://moshahan.github.io/tasks-board/](https://moshahan.github.io/tasks-board/)

## Screenshots

### Board view

Kanban layout with Pending, In Progress, and Completed columns. Search, status, priority, and due-date sort sit above the board. Drag a task onto a different column to drop it there and change its status. Each card shows priority, due date, and actions (complete, edit, duplicate, delete).

![Board view with three status columns and filter controls](docs/screenshots/board.png)

### List view

The same filtered tasks in a compact table. Click Title, Status, Priority, or Due date to sort. Incomplete rows keep a Mark completed action; completed rows do not.

![List view with sortable columns for title, status, priority, and due date](docs/screenshots/list.png)

### Create / edit task

Modal for adding or updating a task. Title is required; description, status, priority, and due date can be set before saving.

![Create task dialog with title, description, status, priority, and due date](docs/screenshots/modal.png)

## Features

- Create and edit tasks with title, description, status, priority, and due date
- Title is required before a task can be saved
- Drag and drop a task onto a different column (Pending, In Progress, or Completed) to move it and update its status
- Delete a task, with confirmation
- Mark a task as completed
- Search by title
- Filter by status and priority (filters combine)
- Sort by due date, earliest or latest first
- Empty state when nothing matches the current filters
- Tasks persist in `localStorage` after a browser refresh
- Seeded with realistic demo tasks on first load

## Stack

- React 19 + TypeScript
- Vite
- ESLint (import order + grouping)
- Vitest + Testing Library
- Husky + lint-staged (lint staged files before each commit)

## Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/tasks-board/`).

### Other commands

```bash
npm run lint        # ESLint
npm run test        # Vitest, single run
npm run test:watch  # Vitest, watch mode
npm run build       # production build
npm run preview     # preview the production build
```

## Persistence

Tasks are saved to `localStorage` under the `tasks-board` key. Clearing site data (or that key) restores the demo board on the next load.

## Project structure

```text
src/
  App.tsx                 # board shell, filters, modal wiring
  components/             # columns, cards, filters, modal, empty state
  constants.ts            # status and priority values
  data/demoTasks.ts       # initial dummy tasks
  hooks/useTaskStore.ts   # CRUD + localStorage
  types.ts
  utils/tasks.ts          # filter, sort, validate, serialize
public/
  favicon.svg
  apple-touch-icon.png
```

## CI and deploy

GitHub Actions run three workflows on `main`:

- Lint
- Test
- Deploy to GitHub Pages

The deploy workflow builds the app and publishes `dist` to GitHub Pages at [https://moshahan.github.io/tasks-board/](https://moshahan.github.io/tasks-board/).

For that URL to work:

1. The GitHub Pages source must be **GitHub Actions** (Settings → Pages → Build and deployment).
2. The repository should be named `tasks-board` under your **MoShahan** account, so Pages serves it at `/tasks-board/`.
