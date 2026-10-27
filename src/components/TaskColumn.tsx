import { useState } from "react";

import type { Status } from "../constants";
import type { Task } from "../types";

import TaskCard from "./TaskCard";

type TaskColumnProps = {
  title: string;
  status: Status;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, status: Status) => void;
};

const TaskColumn = ({
  title,
  status,
  tasks,
  onComplete,
  onEdit,
  onDuplicate,
  onDelete,
  onMove,
}: TaskColumnProps) => {
  const [dragDepth, setDragDepth] = useState(0);

  return (
    <section
      className={`column${dragDepth > 0 ? " is-drop-target" : ""}`}
      aria-label={title}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragDepth((depth) => depth + 1);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={() => {
        setDragDepth((depth) => Math.max(0, depth - 1));
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragDepth(0);
        const taskId = event.dataTransfer.getData("text/plain");
        if (taskId) {
          onMove(taskId, status);
        }
      }}
    >
      <header className="column-header">
        <h2>{title}</h2>
        <span className="column-count">{tasks.length}</span>
      </header>

      <div className="column-body">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
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
