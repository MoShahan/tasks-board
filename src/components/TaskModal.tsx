import type { FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { Priority, Status } from "../constants";
import {
  PRIORITY_LABELS,
  PRIORITY_VALUES,
  STATUS_LABELS,
  STATUS_VALUES,
} from "../constants";
import type { Board, Task, TaskDraft } from "../types";
import { fromDateInputValue, toDateInputValue, validateTaskTitle } from "../utils/tasks";

import SelectField from "./SelectField";

type TaskModalProps = {
  task?: Task | null;
  boards: Board[];
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
};

const defaultDueDate = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 7);
  return date;
};

const TaskModal = ({ task, boards, onClose, onSubmit }: TaskModalProps) => {
  const titleId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [boardId, setBoardId] = useState(task?.boardId ?? boards[0]?.id ?? "");
  const [status, setStatus] = useState<Status>(task?.status ?? "open");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(
    toDateInputValue(task?.dueDate ?? defaultDueDate()),
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateTaskTitle(title);
    if (error) {
      setTitleError(error);
      titleRef.current?.focus();
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      boardId,
      status,
      priority,
      dueDate: fromDateInputValue(dueDate),
      completedAt: status === "completed" ? (task?.completedAt ?? null) : null,
    });
  };

  const heading = task ? "Edit task" : "Create task";

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>{heading}</h2>
          <button
            type="button"
            className="icon-action modal-close"
            onClick={onClose}
            aria-label="Close dialog"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) {
                  setTitleError(validateTaskTitle(event.target.value));
                }
              }}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "title-error" : undefined}
            />
            {titleError ? (
              <span id="title-error" className="field-error" role="alert">
                {titleError}
              </span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div className="modal-grid">
            <SelectField
              label="Board"
              value={boardId}
              onChange={setBoardId}
              options={boards.map((board) => ({
                value: board.id,
                label: board.name,
              }))}
            />

            <SelectField
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as Status)}
              options={STATUS_VALUES.map((value) => ({
                value,
                label: STATUS_LABELS[value],
              }))}
            />
          </div>

          <div className="modal-grid">
            <SelectField
              label="Priority"
              value={priority}
              onChange={(value) => setPriority(value as Priority)}
              options={PRIORITY_VALUES.map((value) => ({
                value,
                label: PRIORITY_LABELS[value],
              }))}
            />

            <label className="field">
              <span className="field-label">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
