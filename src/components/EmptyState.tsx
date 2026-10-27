type EmptyStateProps = {
  hasActiveFilters: boolean;
};

const EmptyState = ({ hasActiveFilters }: EmptyStateProps) => {
  return (
    <div className="empty-state" role="status">
      <p className="empty-title">
        {hasActiveFilters ? "No tasks match these filters" : "No tasks yet"}
      </p>
      <p className="empty-copy">
        {hasActiveFilters
          ? "Try a different search or priority - or clear filters to see the full board."
          : "Create a task to start filling the board."}
      </p>
    </div>
  );
};

export default EmptyState;
