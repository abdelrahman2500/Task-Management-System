import type { TaskPriorityEnum, TaskStatusEnum } from "../types";

export const statusPresentation: Record<
  TaskStatusEnum,
  { label: string; className: string }
> = {
  todo: { label: "To do", className: "bg-slate-100 text-slate-700" },
  in_progress: { label: "In progress", className: "bg-blue-100 text-blue-700" },
  blocked: { label: "Blocked", className: "bg-amber-100 text-amber-700" },
  done: { label: "Done", className: "bg-emerald-100 text-emerald-700" },
};

export const priorityPresentation: Record<
  TaskPriorityEnum,
  { label: string; className: string }
> = {
  low: { label: "Low", className: "text-slate-500" },
  medium: { label: "Medium", className: "text-blue-600" },
  high: { label: "High", className: "text-amber-600" },
  urgent: { label: "Urgent", className: "text-red-600" },
};

export const statusOptions = Object.entries(statusPresentation) as [
  TaskStatusEnum,
  { label: string; className: string },
][];
export const priorityOptions = Object.entries(priorityPresentation) as [
  TaskPriorityEnum,
  { label: string; className: string },
][];
