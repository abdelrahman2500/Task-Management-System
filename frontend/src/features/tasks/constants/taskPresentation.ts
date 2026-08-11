import type { TaskPriorityEnum, TaskStatusEnum } from "../types";

export const statusPresentation: Record<TaskStatusEnum, { label: string; className: string }> = {
  TODO: { label: "To do", className: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In progress", className: "bg-blue-100 text-blue-700" },
  IN_REVIEW: { label: "In review", className: "bg-amber-100 text-amber-700" },
  DONE: { label: "Done", className: "bg-emerald-100 text-emerald-700" },
};

export const priorityPresentation: Record<TaskPriorityEnum, { label: string; className: string }> = {
  LOW: { label: "Low", className: "text-slate-500" },
  MEDIUM: { label: "Medium", className: "text-blue-600" },
  HIGH: { label: "High", className: "text-amber-600" },
  URGENT: { label: "Urgent", className: "text-red-600" },
};

export const statusOptions = Object.entries(statusPresentation) as [TaskStatusEnum, { label: string; className: string }][];
export const priorityOptions = Object.entries(priorityPresentation) as [TaskPriorityEnum, { label: string; className: string }][];
