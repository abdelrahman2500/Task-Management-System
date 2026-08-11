import { Search, X } from "lucide-react";
import { useProjects } from "../../projects/hooks/useProjects";
import { priorityOptions, statusOptions } from "../constants/taskPresentation";
import type {
  GetTasksParams,
  TaskPriorityEnum,
  TaskStatusEnum,
} from "../types";

interface TaskFiltersProps {
  filters: GetTasksParams;
  onChange: (filters: GetTasksParams) => void;
}

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  // Fetch all projects for the filter dropdown (no pagination limit needed here)
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    limit: 100,
  });
  const projects = projectsData?.data ?? [];

  const hasFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.projectId,
  );
  const update = (changes: Partial<GetTasksParams>) =>
    onChange({ ...filters, ...changes, page: 1 });

  return (
    <section
      aria-label="Filter tasks"
      className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_220px_auto] xl:items-center">
        {/* Search */}
        <div className="relative">
          <Search
            aria-hidden="true"
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <label className="sr-only" htmlFor="task-search">
            Search tasks
          </label>
          <input
            id="task-search"
            type="search"
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value || undefined })}
            placeholder="Search by title or description"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status */}
        <select
          aria-label="Filter by status"
          value={filters.status ?? ""}
          onChange={(e) =>
            update({
              status: (e.target.value || undefined) as
                | TaskStatusEnum
                | undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All statuses</option>
          {statusOptions.map(([value, option]) => (
            <option key={value} value={value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          aria-label="Filter by priority"
          value={filters.priority ?? ""}
          onChange={(e) =>
            update({
              priority: (e.target.value || undefined) as
                | TaskPriorityEnum
                | undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All priorities</option>
          {priorityOptions.map(([value, option]) => (
            <option key={value} value={value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Project */}
        <select
          aria-label="Filter by project"
          disabled={projectsLoading}
          value={filters.projectId ?? ""}
          onChange={(e) =>
            update({
              projectId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={selectClass}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ page: 1, limit: filters.limit })}
            className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
