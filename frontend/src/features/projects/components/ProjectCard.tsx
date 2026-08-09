import { FolderKanban } from "lucide-react";
import type { Project } from "../types";
import { Button } from "../../../shared/components/ui/Button";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <FolderKanban className="h-8 w-8 text-blue-600" />

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {project.status}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>

      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
        {project.description ?? "No description provided."}
      </p>

      <div className="mt-6 text-xs text-slate-400 mb-4">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </div>
      <div className="flex gap-4">
        <Button
          className="flex-auto"
          variant="outline"
          size="sm"
          onClick={() => onEdit(project)}
        >
          Edit
        </Button>
        <Button
          className="flex-1"
          variant="danger"
          size="sm"
          onClick={() => onDelete(project.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
