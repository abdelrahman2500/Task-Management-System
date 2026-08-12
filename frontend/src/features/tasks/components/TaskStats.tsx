import { CheckCircle2, CircleDashed, Clock3, ListTodo } from "lucide-react";
import type { Task } from "../types";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const stats = [
    {
      label: "Total (this page)",
      value: tasks.length,
      icon: ListTodo,
      className: "bg-slate-100 text-slate-700",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in_progress").length,
      icon: Clock3,
      className: "bg-blue-100 text-blue-700",
    },
    {
      label: "Blocked",
      value: tasks.filter((t) => t.status === "blocked").length,
      icon: CircleDashed,
      className: "bg-amber-100 text-amber-700",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "done").length,
      icon: CheckCircle2,
      className: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <section
      aria-label="Task statistics"
      className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map(({ label, value, icon: Icon, className }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className={`rounded-lg p-2 ${className}`}>
              <Icon size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
      ))}
    </section>
  );
}
