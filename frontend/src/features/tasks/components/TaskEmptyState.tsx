import { ClipboardList, SearchX } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface TaskEmptyStateProps {
  hasFilters: boolean;
  onCreate: () => void;
  onClearFilters: () => void;
}

export function TaskEmptyState({ hasFilters, onCreate, onClearFilters }: TaskEmptyStateProps) {
  const Icon = hasFilters ? SearchX : ClipboardList;
  const title = hasFilters ? "No tasks match these filters" : "No tasks yet";
  const description = hasFilters
    ? "Try adjusting your search or filter selections to find what you need."
    : "Create your first task to start tracking work and progress across projects.";

  return <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
    <span className="rounded-full bg-slate-100 p-3 text-slate-500"><Icon size={28} aria-hidden="true" /></span>
    <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    <Button variant={hasFilters ? "outline" : "primary"} className="mt-6 w-full sm:w-auto" onClick={hasFilters ? onClearFilters : onCreate}>{hasFilters ? "Clear filters" : "Create task"}</Button>
  </section>;
}
