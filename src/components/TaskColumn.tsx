import { useState } from "react";

import type { Board, DragKind, Task } from "../types";

import TaskCard from "./TaskCard";

type TaskColumnProps = {
  board: Board;
  tasks: Task[];
  dragKind: DragKind | null;
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
  dragKind,
  onComplete,
  onUncomplete,
  onEdit,
  onDuplicate,
  onDeleteTask,
  onMoveTask,
  onReorderBoard,
  onDragKind,
}: TaskColumnProps) => {
  const [dragDepth, setDragDepth] = useState(0);
  const [dropPlace, setDropPlace] = useState<"before" | "after" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      draggable
      onDragStart={(event) => {
        const target = event.target as HTMLElement;
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
        <h2>{board.name}</h2>
        <span className="column-count">{tasks.length}</span>
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
