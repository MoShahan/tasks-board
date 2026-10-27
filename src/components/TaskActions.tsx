import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";

import type { Task } from "../types";

type TaskActionsProps = {
  task: Task;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

type TooltipState = {
  label: string;
  x: number;
  y: number;
  place: "above" | "below";
};

type ActionIconButtonProps = {
  label: string;
  className?: string;
  onClick: () => void;
  onShowTooltip: (label: string, el: HTMLElement) => void;
  onHideTooltip: () => void;
  children: ReactNode;
};

const Icon = ({ children }: { children: ReactNode }) => (
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
    {children}
  </svg>
);

const ActionIconButton = ({
  label,
  className = "",
  onClick,
  onShowTooltip,
  onHideTooltip,
  children,
}: ActionIconButtonProps) => (
  <button
    type="button"
    className={`icon-action ${className}`.trim()}
    aria-label={label}
    onClick={() => {
      onHideTooltip();
      onClick();
    }}
    onMouseEnter={(event) => onShowTooltip(label, event.currentTarget)}
    onMouseLeave={onHideTooltip}
    onFocus={(event) => onShowTooltip(label, event.currentTarget)}
    onBlur={onHideTooltip}
  >
    {children}
  </button>
);

const TaskActions = ({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDuplicate,
  onDelete,
}: TaskActionsProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (label: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const place = window.innerHeight - rect.bottom > 44 ? "below" : "above";

    setTooltip({
      label,
      x: rect.left + rect.width / 2,
      y: place === "below" ? rect.bottom + 8 : rect.top - 8,
      place,
    });
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <div className="task-actions">
      <span className="complete-slot">
        {task.status === "completed" ? (
          <ActionIconButton
            label="Mark incomplete"
            className="icon-action-incomplete"
            onClick={() => onUncomplete(task.id)}
            onShowTooltip={showTooltip}
            onHideTooltip={hideTooltip}
          >
            <Icon>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </Icon>
          </ActionIconButton>
        ) : (
          <ActionIconButton
            label="Mark completed"
            className="icon-action-complete"
            onClick={() => onComplete(task.id)}
            onShowTooltip={showTooltip}
            onHideTooltip={hideTooltip}
          >
            <Icon>
              <path d="M20 6 9 17l-5-5" />
            </Icon>
          </ActionIconButton>
        )}
      </span>
      <ActionIconButton
        label="Edit"
        onClick={() => onEdit(task)}
        onShowTooltip={showTooltip}
        onHideTooltip={hideTooltip}
      >
        <Icon>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </Icon>
      </ActionIconButton>
      <ActionIconButton
        label="Duplicate"
        onClick={() => onDuplicate(task.id)}
        onShowTooltip={showTooltip}
        onHideTooltip={hideTooltip}
      >
        <Icon>
          <rect width="13" height="13" x="9" y="9" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </Icon>
      </ActionIconButton>
      <ActionIconButton
        label="Delete"
        className="icon-action-danger"
        onClick={() => onDelete(task.id)}
        onShowTooltip={showTooltip}
        onHideTooltip={hideTooltip}
      >
        <Icon>
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </Icon>
      </ActionIconButton>
      {tooltip
        ? createPortal(
            <span
              className={`action-tooltip action-tooltip-${tooltip.place}`}
              role="tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.label}
            </span>,
            document.body,
          )
        : null}
    </div>
  );
};

export default TaskActions;
