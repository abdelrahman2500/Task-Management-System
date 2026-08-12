import { Calendar, Flag, User } from "lucide-react";
import type { Task, TaskPriorityEnum, TaskStatusEnum } from "../types";
import { Button } from "../../../shared/components/ui/Button";

// ─── Badge config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  TaskStatusEnum,
  { label: string; className: string }
> = {
  todo: { label: "To Do", className: "bg-slate-100 text-slate-600" },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  blocked: { label: "Blocked", className: "bg-amber-100 text-amber-700" },
  done: { label: "Done", className: "bg-green-100 text-green-700" },
};

const priorityConfig: Record<
  TaskPriorityEnum,
  { label: string; className: string }
> = {
  low: { label: "Low", className: "text-slate-400" },
  medium: { label: "Medium", className: "text-blue-500" },
  high: { label: "High", className: "text-amber-500" },
  urgent: { label: "Urgent", className: "text-red-500" },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${priority.className}`}
        >
          <Flag size={12} />
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-slate-900">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 ${isOverdue ? "font-medium text-red-500" : ""}`}
          >
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assigneeId && (
          <span className="flex items-center gap-1">
            <User size={12} />#{task.assigneeId}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(task)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
