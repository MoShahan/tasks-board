import type { Toast } from "../hooks/useToasts";

type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="status">
          <p>{toast.message}</p>
          <div className="toast-actions">
            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                className="btn btn-subtle"
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
              >
                {toast.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="icon-action"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
