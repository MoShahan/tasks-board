import { useMemo, useState } from "react";

import logo from "./assets/logo.svg";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import TaskColumn from "./components/TaskColumn";
import TaskList from "./components/TaskList";
import TaskModal from "./components/TaskModal";
import ToastStack from "./components/ToastStack";
import ViewToggle from "./components/ViewToggle";
import { useTaskStore } from "./hooks/useTaskStore";
import { useToasts } from "./hooks/useToasts";
import { boardNameById } from "./utils/boards";
import { filterTasks, sortTasks, sortTasksBy } from "./utils/tasks";
import type {
  DragKind,
  ListSortKey,
  SortDirection,
  Task,
  TaskDraft,
  TaskFilters,
  ViewMode,
} from "./types";

import "./App.css";

const defaultFilters: TaskFilters = {
  search: "",
  priority: "all",
};

function App() {
  const {
    boards,
    tasks,
    create,
    update,
    complete,
    uncomplete,
    remove,
    duplicate,
    restore,
    createBoard,
    updateBoard,
    removeBoard,
    reorderBoards,
  } = useTaskStore();
  const { toasts, push, dismiss } = useToasts();
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [view, setView] = useState<ViewMode>("board");
  const [listSort, setListSort] = useState<{
    key: ListSortKey;
    direction: SortDirection;
  }>({ key: "dueDate", direction: "asc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newBoardId, setNewBoardId] = useState<string | null>(null);
  const [dragKind, setDragKind] = useState<DragKind | null>(null);

  const hasActiveFilters =
    filters.search.trim() !== "" || filters.priority !== "all";

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters, hideCompleted),
    [tasks, filters, hideCompleted],
  );

  const boardTasks = useMemo(
    () => sortTasks(filteredTasks, sortDirection),
    [filteredTasks, sortDirection],
  );

  const listTasks = useMemo(
    () => sortTasksBy(filteredTasks, listSort.key, listSort.direction, boards),
    [filteredTasks, listSort, boards],
  );

  const visibleTasks = view === "board" ? boardTasks : listTasks;
  const showListEmpty = view === "list" && visibleTasks.length === 0;

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (draft: TaskDraft) => {
    if (editingTask) {
      update(editingTask.id, draft);
      push({ message: `Updated “${draft.title}”` });
    } else {
      create(draft);
      push({ message: `Created “${draft.title}”` });
    }
    closeModal();
  };

  const handleComplete = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    complete(taskId);
    if (task) {
      push({ message: `Marked “${task.title}” completed` });
    }
  };

  const handleUncomplete = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    uncomplete(taskId);
    if (task) {
      push({ message: `Marked “${task.title}” incomplete` });
    }
  };

  const handleDuplicate = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    duplicate(taskId);
    if (task) {
      push({ message: `Duplicated “${task.title}”` });
    }
  };

  const handleDelete = (taskId: string) => {
    const index = tasks.findIndex((item) => item.id === taskId);
    const task = tasks[index];
    if (!task) {
      return;
    }

    remove(taskId);
    push({
      message: `Deleted “${task.title}”`,
      actionLabel: "Undo",
      duration: 7000,
      onAction: () => {
        restore(task, index);
        push({ message: `Restored “${task.title}”` });
      },
    });
  };

  const handleViewChange = (nextView: ViewMode) => {
    setView(nextView);
    if (nextView === "list") {
      setListSort((current) =>
        current.key === "dueDate"
          ? { ...current, direction: sortDirection }
          : current,
      );
    }
  };

  const handleMove = (taskId: string, boardId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.boardId === boardId) {
      return;
    }

    update(taskId, { boardId });
    push({
      message: `Moved “${task.title}” to ${boardNameById(boards, boardId)}`,
    });
  };

  const handleListSort = (key: ListSortKey) => {
    setListSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const handleAddBoard = () => {
    const id = createBoard();
    setNewBoardId(id);
    push({ message: "Created a new board" });
  };

  const handleRenameBoard = (boardId: string, name: string) => {
    updateBoard(boardId, name);
    push({ message: `Renamed board to “${name}”` });
  };

  const handleDeleteBoard = (boardId: string) => {
    const board = boards.find((item) => item.id === boardId);
    if (!board) {
      return;
    }

    if (tasks.some((task) => task.boardId === boardId)) {
      push({
        message: `“${board.name}” must be empty before it can be deleted.`,
      });
      return;
    }

    if (boards.length <= 1) {
      push({ message: "Keep at least one board." });
      return;
    }

    removeBoard(boardId);
    push({ message: `Deleted “${board.name}”` });
  };

  const handleReorderBoard = (
    boardId: string,
    targetBoardId: string,
    place: "before" | "after",
  ) => {
    if (boardId === targetBoardId) {
      return;
    }

    const board = boards.find((item) => item.id === boardId);
    reorderBoards(boardId, targetBoardId, place);
    if (board) {
      push({ message: `Reordered “${board.name}”` });
    }
  };

  const taskHandlers = {
    onComplete: handleComplete,
    onUncomplete: handleUncomplete,
    onEdit: openEdit,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <img src={logo} alt="" className="brand-logo" width={36} height={36} />
          <div>
            <p className="brand-kicker">Task manager</p>
            <h1>Tasks Board</h1>
          </div>
        </div>
        <div className="header-actions">
          <ViewToggle view={view} onChange={handleViewChange} />
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add task
          </button>
        </div>
      </header>

      <FilterBar
        filters={filters}
        sortDirection={sortDirection}
        hasActiveFilters={hasActiveFilters}
        hideCompleted={hideCompleted}
        showDueDateSort={view === "board"}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onPriorityChange={(priority) =>
          setFilters((current) => ({ ...current, priority }))
        }
        onSortChange={setSortDirection}
        onHideCompletedChange={setHideCompleted}
        onClear={() => {
          setFilters(defaultFilters);
          push({ message: "Filters cleared" });
        }}
      />

      {showListEmpty ? (
        <EmptyState hasActiveFilters={hasActiveFilters || hideCompleted} />
      ) : view === "board" ? (
        <div className="board">
          {boards.map((board) => (
            <TaskColumn
              key={board.id}
              board={board}
              tasks={boardTasks.filter((task) => task.boardId === board.id)}
              autoEdit={board.id === newBoardId}
              dragKind={dragKind}
              onRename={handleRenameBoard}
              onMoveTask={handleMove}
              onReorderBoard={handleReorderBoard}
              onDragKind={setDragKind}
              onAutoEditDone={() => setNewBoardId(null)}
              onDeleteTask={handleDelete}
              onDelete={handleDeleteBoard}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
            />
          ))}
          <button type="button" className="add-board" onClick={handleAddBoard}>
            Add board
          </button>
        </div>
      ) : (
        <TaskList
          tasks={listTasks}
          boards={boards}
          sortKey={listSort.key}
          sortDirection={listSort.direction}
          onSort={handleListSort}
          {...taskHandlers}
        />
      )}

      {modalOpen ? (
        <TaskModal
          task={editingTask}
          boards={boards}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
