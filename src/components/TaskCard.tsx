import { useState } from "react";

import { PRIORITY_LABELS } from "../constants";
import type { Task } from "../types";
import { formatCompletedOn, formatDueDate, isOverdue } from "../utils/tasks";

import TaskActions from "./TaskActions";

type TaskCardProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onDragKind: (kind: "task" | null) => void;
};

const TaskCard = ({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDuplicate,
  onDelete,
  onDragKind,
}: TaskCardProps) => {
  const overdue = isOverdue(task);
  const [isDragging, setIsDragging] = useState(false);
  const completed = task.status === "completed";

  return (
    <article
      className={`task-card${isDragging ? " is-dragging" : ""}${
        completed ? " is-completed" : ""
      }`}
      draggable
      onDragStart={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button")) {
          event.preventDefault();
          return;
        }

        event.stopPropagation();
        event.dataTransfer.setData("text/plain", `task:${task.id}`);
        event.dataTransfer.setData("text/x-task", task.id);
        event.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
        onDragKind("task");
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragKind(null);
      }}
    >
      <div className="task-card-top">
        <span className={`chip chip-${task.priority}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <time
          className={`due-date${overdue ? " overdue" : ""}`}
          dateTime={task.dueDate.toISOString()}
        >
          {overdue ? "Overdue · " : ""}
          {formatDueDate(task.dueDate)}
        </time>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description ? (
        <p className="task-description">{task.description}</p>
      ) : null}
      {completed && task.completedAt ? (
        <time
          className="completed-on"
          dateTime={task.completedAt.toISOString()}
        >
          {formatCompletedOn(task.completedAt)}
        </time>
      ) : null}

      <TaskActions
        task={task}
        onComplete={onComplete}
        onUncomplete={onUncomplete}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </article>
  );
};

export default TaskCard;
