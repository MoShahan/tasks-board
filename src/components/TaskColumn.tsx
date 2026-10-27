import { useEffect, useRef, useState } from "react";

import type { Board, DragKind, Task } from "../types";
import { validateBoardName } from "../utils/boards";

import TaskCard from "./TaskCard";

type TaskColumnProps = {
  board: Board;
  tasks: Task[];
  autoEdit?: boolean;
  dragKind: DragKind | null;
  onRename: (boardId: string, name: string) => void;
  onDelete: (boardId: string) => void;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, boardId: string) => void;
  onReorderBoard: (
    boardId: string,
    targetBoardId: string,
    place: "before" | "after",
  ) => void;
  onDragKind: (kind: DragKind | null) => void;
  onAutoEditDone?: () => void;
};

function parseDragPayload(raw: string): { kind: DragKind; id: string } | null {
  if (raw.startsWith("task:")) {
    return { kind: "task", id: raw.slice(5) };
  }

  if (raw.startsWith("board:")) {
    return { kind: "board", id: raw.slice(6) };
  }

  return null;
}

const TaskColumn = ({
  board,
  tasks,
  autoEdit = false,
  dragKind,
  onRename,
  onDelete,
  onComplete,
  onUncomplete,
  onEdit,
  onDuplicate,
  onDeleteTask,
  onMoveTask,
  onReorderBoard,
  onDragKind,
  onAutoEditDone,
}: TaskColumnProps) => {
  const [dragDepth, setDragDepth] = useState(0);
  const [dropPlace, setDropPlace] = useState<"before" | "after" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editing, setEditing] = useState(autoEdit);
  const [draftName, setDraftName] = useState(board.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    setDraftName(board.name);
    setNameError(null);
    setEditing(true);
  };

  const commitName = () => {
    const error = validateBoardName(draftName);
    if (error) {
      setNameError(error);
      nameRef.current?.focus();
      return;
    }

    const nextName = draftName.trim();
    if (nextName !== board.name) {
      onRename(board.id, nextName);
    }

    setNameError(null);
    setEditing(false);
    onAutoEditDone?.();
  };

  const cancelName = () => {
    setDraftName(board.name);
    setNameError(null);
    setEditing(false);
    onAutoEditDone?.();
  };

  const updateDropPlace = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setDropPlace(clientX < rect.left + rect.width / 2 ? "before" : "after");
  };

  return (
    <section
      className={`column${dragDepth > 0 && dragKind === "task" ? " is-drop-target" : ""}${
        dragDepth > 0 && dragKind === "board" && dropPlace
          ? ` is-drop-${dropPlace}`
          : ""
      }${isDragging ? " is-dragging" : ""}`}
      aria-label={board.name}
      draggable={!editing}
      onDragStart={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, .column-header button")) {
          event.preventDefault();
          return;
        }

        if (target.closest(".task-card")) {
          return;
        }

        event.dataTransfer.setData("text/plain", `board:${board.id}`);
        event.dataTransfer.setData("text/x-board", board.id);
        event.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
        onDragKind("board");
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setDragDepth(0);
        setDropPlace(null);
        onDragKind(null);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragDepth((depth) => depth + 1);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dragKind === "board") {
          updateDropPlace(event.clientX, event.currentTarget);
        }
      }}
      onDragLeave={() => {
        setDragDepth((depth) => {
          const next = Math.max(0, depth - 1);
          if (next === 0) {
            setDropPlace(null);
          }
          return next;
        });
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragDepth(0);
        setDropPlace(null);

        const payload = parseDragPayload(event.dataTransfer.getData("text/plain"));
        if (!payload) {
          return;
        }

        if (payload.kind === "task") {
          onMoveTask(payload.id, board.id);
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const place =
          event.clientX < rect.left + rect.width / 2 ? "before" : "after";
        onReorderBoard(payload.id, board.id, place);
      }}
    >
      <header className="column-header">
        {editing ? (
          <label className="column-name-field">
            <span className="visually-hidden">Board name</span>
            <input
              ref={nameRef}
              className="column-name-input"
              value={draftName}
              aria-label="Board name"
              aria-invalid={Boolean(nameError)}
              onChange={(event) => {
                setDraftName(event.target.value);
                if (nameError) {
                  setNameError(validateBoardName(event.target.value));
                }
              }}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitName();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelName();
                }
              }}
            />
            {nameError ? (
              <span className="field-error" role="alert">
                {nameError}
              </span>
            ) : null}
          </label>
        ) : (
          <button
            type="button"
            className="column-title"
            onClick={startEditing}
          >
            <h2>{board.name}</h2>
          </button>
        )}
        <div className="column-header-meta">
          <span className="column-count">{tasks.length}</span>
          {editing ? (
            <button
              type="button"
              className="icon-action icon-action-complete column-save"
              aria-label="Save board name"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitName}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="icon-action column-rename"
              aria-label={`Rename ${board.name}`}
              onClick={startEditing}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="icon-action icon-action-danger column-delete"
            aria-label={`Delete ${board.name}`}
            onClick={() => onDelete(board.id)}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        </div>
      </header>

      <div className="column-body">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDeleteTask}
              onDragKind={onDragKind}
            />
          ))
        ) : (
          <p className="column-empty">No tasks in this column</p>
        )}
      </div>
    </section>
  );
};

export default TaskColumn;
