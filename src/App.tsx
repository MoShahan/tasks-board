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
import { filterTasks, sortTasks, sortTasksBy } from "./utils/tasks";
import type { Status } from "./constants";
import { STATUS_LABELS } from "./constants";
import type {
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
  status: "all",
  priority: "all",
};

function App() {
  const { tasks, create, update, complete, remove, duplicate, restore } =
    useTaskStore();
  const { toasts, push, dismiss } = useToasts();
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [view, setView] = useState<ViewMode>("board");
  const [listSort, setListSort] = useState<{
    key: ListSortKey;
    direction: SortDirection;
  }>({ key: "dueDate", direction: "asc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all";

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters],
  );

  const boardTasks = useMemo(
    () => sortTasks(filteredTasks, sortDirection),
    [filteredTasks, sortDirection],
  );

  const listTasks = useMemo(
    () => sortTasksBy(filteredTasks, listSort.key, listSort.direction),
    [filteredTasks, listSort],
  );

  const visibleTasks = view === "board" ? boardTasks : listTasks;

  const pendingTasks = boardTasks.filter((task) => task.status === "pending");
  const inProgressTasks = boardTasks.filter(
    (task) => task.status === "in-progress",
  );
  const completedTasks = boardTasks.filter(
    (task) => task.status === "completed",
  );

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

  const handleMove = (taskId: string, status: Status) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) {
      return;
    }

    update(taskId, { status });
    push({ message: `Moved “${task.title}” to ${STATUS_LABELS[status]}` });
  };

  const handleListSort = (key: ListSortKey) => {
    setListSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const taskHandlers = {
    onComplete: handleComplete,
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
        showDueDateSort={view === "board"}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onStatusChange={(status) =>
          setFilters((current) => ({ ...current, status }))
        }
        onPriorityChange={(priority) =>
          setFilters((current) => ({ ...current, priority }))
        }
        onSortChange={setSortDirection}
        onClear={() => {
          setFilters(defaultFilters);
          push({ message: "Filters cleared" });
        }}
      />

      {visibleTasks.length === 0 ? (
        <EmptyState hasActiveFilters={hasActiveFilters} />
      ) : view === "board" ? (
        <div className="board">
          <TaskColumn
            title="Pending"
            status="pending"
            tasks={pendingTasks}
            onMove={handleMove}
            {...taskHandlers}
          />
          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={inProgressTasks}
            onMove={handleMove}
            {...taskHandlers}
          />
          <TaskColumn
            title="Completed"
            status="completed"
            tasks={completedTasks}
            onMove={handleMove}
            {...taskHandlers}
          />
        </div>
      ) : (
        <TaskList
          tasks={listTasks}
          sortKey={listSort.key}
          sortDirection={listSort.direction}
          onSort={handleListSort}
          {...taskHandlers}
        />
      )}

      {modalOpen ? (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
