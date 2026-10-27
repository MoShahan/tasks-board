# Tasks Board

A dark-themed task board for creating, editing, completing, and organizing work across customizable columns. Boards start as Todo, Progress, and Done. You can add, rename, delete, and drag them into any order. Drag a card onto another board to move it; completion is separate from the column.

Live site: [https://moshahan.github.io/tasks-board/](https://moshahan.github.io/tasks-board/)

## Screenshots

### Board view

Kanban layout with custom boards. Search, priority, due-date sort, and Hide completed sit above the board. Drag a task onto a different board to move it. Drag a board to reorder columns. Each card shows priority, due date, completed-on date when finished, and actions (complete or incomplete, edit, duplicate, delete).

![Board view with custom columns and filter controls](docs/screenshots/board.png)

### List view

The same filtered tasks in a compact table. Click Title, Board, Status, Priority, or Due date to sort. Every row can be marked completed or incomplete.

![List view with sortable columns for title, board, status, priority, and due date](docs/screenshots/list.png)

### Create / edit task

Modal for adding or updating a task. Title is required; description, board, status, priority, and due date can be set before saving.

![Create task dialog with title, description, board, status, priority, and due date](docs/screenshots/modal.png)

## Features

- Create and edit tasks with title, description, board, status (open or completed), priority, and due date
- Title is required before a task can be saved
- Default boards are Todo, Progress, and Done
- Add as many custom boards as you want, with any name
- Rename a board from the pencil, the title, or the tick while editing
- Delete a board only when it is empty and it is not the last board; a toast explains why otherwise
- Drag a board left or right to reorder columns
- Drag a task onto another board to change its column only, not its completion
- Mark a task completed or incomplete in place; completed cards are muted, struck through, and show the completed-on date
- Hide completed tasks from the board and list with a switch
- Duplicate a task
- Delete a task or an empty board, then Undo from the toast for 5 seconds
- Search by title
- Filter by priority
- Sort the board by due date, earliest or latest first
- Switch between board and list views
- Sort the list by title, board, status, priority, or due date
- Empty copy when a column or the list has no matching tasks
- Toasts for create, move, rename, and other actions; dismiss with the X
- Boards and tasks persist in `localStorage` after a refresh
- Seeded with demo boards and tasks on first load; older saved data is migrated to custom boards

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

Boards and tasks are saved to `localStorage` under the `tasks-board` key. Clearing site data (or that key) restores the demo boards on the next load.

## Project structure

```text
src/
  App.tsx                 # board shell, filters, modal wiring
  components/             # columns, cards, filters, modal, empty state
  constants.ts            # default boards, status, and priority values
  data/demoTasks.ts       # initial dummy boards and tasks
  hooks/useTaskStore.ts   # board and task CRUD + localStorage
  types.ts
  utils/boards.ts         # board create, rename, delete, reorder
  utils/tasks.ts          # filter, sort, complete, validate, serialize
public/
  favicon.svg
  apple-touch-icon.png
```

## CI and deploy

GitHub Actions run on `main`:

- **Lint** and **Test** on every push and pull request (`npm run lint`, `npm test`)
- **Deploy** on every push to `main`, or when started by hand: builds the app and publishes `dist` to GitHub Pages

The live site is [https://moshahan.github.io/tasks-board/](https://moshahan.github.io/tasks-board/). In the repo settings, set Pages to deploy with **GitHub Actions**.
