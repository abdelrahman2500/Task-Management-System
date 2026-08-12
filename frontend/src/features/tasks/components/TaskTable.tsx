import {
  CalendarDays,
  ChevronRight,
  Flag,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import {
  priorityPresentation,
  statusPresentation,
} from "../constants/taskPresentation";
import type { Task } from "../types";

interface TaskTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const formatDate = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "No due date";
const isOverdue = (task: Task) =>
  Boolean(
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date(),
  );

function Actions({
  task,
  onView,
  onEdit,
  onDelete,
}: TaskTableProps & { task: Task }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onView(task)}
        className="rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        View
      </button>
      <details className="relative">
        <summary
          aria-label={`Actions for ${task.title}`}
          className="cursor-pointer list-none rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <MoreHorizontal size={18} />
        </summary>
        <div className="absolute right-0 z-10 mt-1 w-28 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="w-full rounded px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </details>
    </div>
  );
}

export function TaskTable({ tasks, onView, onEdit, onDelete }: TaskTableProps) {
  return (
    <section
      aria-label="Tasks"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Task</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const status = statusPresentation[task.status];
              const priority = priorityPresentation[task.priority];
              return (
                <tr key={task.id} className="transition hover:bg-slate-50/80">
                  <td className="max-w-xs px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="block max-w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="block truncate font-medium text-slate-900">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {task.description}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className={`px-4 py-4 font-medium ${priority.className}`}>
                    <span className="inline-flex items-center gap-1">
                      <Flag size={13} />
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {task.assigneeId ? (
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={14} />#{task.assigneeId}
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </td>
                  <td
                    className={`px-4 py-4 ${isOverdue(task) ? "font-medium text-red-600" : "text-slate-600"}`}
                  >
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-5 py-4">
                    <Actions
                      task={task}
                      tasks={tasks}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 xl:hidden">
        {tasks.map((task) => {
          const status = statusPresentation[task.status];
          const priority = priorityPresentation[task.priority];
          return (
            <article key={task.id} className="p-4">
              <button
                type="button"
                onClick={() => onView(task)}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 font-semibold text-slate-900">
                    {task.title}
                  </h2>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </div>
                {task.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {task.description}
                  </p>
                )}
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium ${priority.className}`}
                >
                  <Flag size={12} />
                  {priority.label}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span
                  className={`inline-flex items-center gap-1 ${isOverdue(task) ? "font-medium text-red-600" : ""}`}
                >
                  <CalendarDays size={14} />
                  {formatDate(task.dueDate)}
                </span>
                <Actions
                  task={task}
                  tasks={tasks}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
