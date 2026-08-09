import { Search } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import type { GetTasksParams, TaskPriorityEnum, TaskStatusEnum } from "../types";

interface TasksHeaderProps {
  filters: GetTasksParams;
  onFilterChange: (filters: GetTasksParams) => void;
  onCreate: () => void;
}

export default function TasksHeader({
  filters,
  onFilterChange,
  onCreate,
}: TasksHeaderProps) {
  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mb-6 space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Manage and track all your tasks.</p>
        </div>
        <Button id="create-task-btn" className="w-auto" onClick={onCreate}>
          New Task
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="task-search"
            type="text"
            placeholder="Search tasks..."
            value={filters.search ?? ""}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status filter */}
        <select
          id="task-filter-status"
          value={filters.status ?? ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: (e.target.value as TaskStatusEnum) || undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority filter */}
        <select
          id="task-filter-priority"
          value={filters.priority ?? ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              priority: (e.target.value as TaskPriorityEnum) || undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        {/* Clear filters */}
        {(filters.search || filters.status || filters.priority) && (
          <button
            id="task-clear-filters"
            onClick={() => onFilterChange({})}
            className="text-sm text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
