import { Plus } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface TasksHeaderProps {
  onCreate: () => void;
}

export default function TasksHeader({
  onCreate,
}: TasksHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">Plan, prioritize, and track work across projects.</p>
        </div>
        <Button id="create-task-btn" className="w-full sm:w-auto" onClick={onCreate}>
          <Plus size={17} className="mr-2" aria-hidden="true" /> New task
        </Button>
    </header>
  );
}
