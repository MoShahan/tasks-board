import { useId } from "react";

import type { Priority } from "../constants";
import type { SortDirection, TaskFilters } from "../types";

import SelectField from "./SelectField";

type FilterBarProps = {
  filters: TaskFilters;
  sortDirection: SortDirection;
  hasActiveFilters: boolean;
  hideCompleted: boolean;
  showDueDateSort?: boolean;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: Priority | "all") => void;
  onSortChange: (value: SortDirection) => void;
  onHideCompletedChange: (value: boolean) => void;
  onClear: () => void;
};

const FilterBar = ({
  filters,
  sortDirection,
  hasActiveFilters,
  hideCompleted,
  showDueDateSort = true,
  onSearchChange,
  onPriorityChange,
  onSortChange,
  onHideCompletedChange,
  onClear,
}: FilterBarProps) => {
  const hideCompletedLabelId = useId();

  return (
    <section
      className={`filter-bar${showDueDateSort ? "" : " filter-bar-list"}`}
      aria-label="Task filters"
    >
      <label className="field search-field">
        <span className="field-label">Search</span>
        <input
          type="search"
          placeholder="Search by title"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <SelectField
        label="Priority"
        value={filters.priority}
        onChange={(value) => onPriorityChange(value as Priority | "all")}
        options={[
          { value: "all", label: "All priorities" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
      />

      {showDueDateSort ? (
        <SelectField
          label="Sort by due date"
          value={sortDirection}
          onChange={(value) => onSortChange(value as SortDirection)}
          options={[
            { value: "asc", label: "Earliest first" },
            { value: "desc", label: "Latest first" },
          ]}
        />
      ) : null}

      <div className="field hide-completed-field">
        <span className="field-label" id={hideCompletedLabelId}>
          Hide completed
        </span>
        <button
          type="button"
          className={`hide-completed-switch${hideCompleted ? " is-on" : ""}`}
          role="switch"
          aria-checked={hideCompleted}
          aria-labelledby={hideCompletedLabelId}
          onClick={() => onHideCompletedChange(!hideCompleted)}
        >
          <span className="hide-completed-track" aria-hidden="true" />
          <span className="hide-completed-copy">
            {hideCompleted ? "Hidden" : "Shown"}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="btn btn-ghost filter-clear"
        onClick={onClear}
        disabled={!hasActiveFilters}
      >
        Clear filters
      </button>
    </section>
  );
};

export default FilterBar;
