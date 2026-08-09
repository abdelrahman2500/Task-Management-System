import { ClipboardList } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface EmptyTasksProps {
  onCreate: () => void;
}

export function EmptyTasks({ onCreate }: EmptyTasksProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16">
      <ClipboardList className="mb-4 h-16 w-16 text-slate-400" />

      <h2 className="text-2xl font-semibold text-slate-900">No Tasks Yet</h2>

      <p className="mt-2 max-w-sm text-center text-slate-500">
        Create your first task to start tracking work and progress across your
        projects.
      </p>

      <Button className="mt-8 w-auto px-6" onClick={onCreate}>
        Create Task
      </Button>
    </div>
  );
}
