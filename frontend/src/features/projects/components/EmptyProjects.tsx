import { FolderOpen } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface EmptyProjectsProps {
  onCreateProject?: () => void;
}

export function EmptyProjects({ onCreateProject }: EmptyProjectsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16">
      <FolderOpen className="mb-4 h-16 w-16 text-slate-400" />

      <h2 className="text-2xl font-semibold text-slate-900">No Projects Yet</h2>

      <p className="mt-2 max-w-sm text-center text-slate-500">
        Create your first project to start managing tasks and collaborating with
        your team.
      </p>

      <Button className="mt-8 w-auto px-6" onClick={onCreateProject}>
        Create Project
      </Button>
    </div>
  );
}
