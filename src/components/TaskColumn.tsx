import { useState } from "react";

import type { Board, Task } from "../types";

import TaskCard from "./TaskCard";

type TaskColumnProps = {
  board: Board;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, boardId: string) => void;
  onDragKind: (kind: "task" | null) => void;
};

const TaskColumn = ({
  board,
  tasks,
  onComplete,
  onUncomplete,
  onEdit,
  onDuplicate,
  onDeleteTask,
  onMoveTask,
  onDragKind,
}: TaskColumnProps) => {
  const [dragDepth, setDragDepth] = useState(0);

  return (
    <section
      className={`column${dragDepth > 0 ? " is-drop-target" : ""}`}
      aria-label={board.name}
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
        const raw = event.dataTransfer.getData("text/plain");
        const taskId = raw.startsWith("task:") ? raw.slice(5) : raw;
        if (taskId) {
          onMoveTask(taskId, board.id);
        }
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
