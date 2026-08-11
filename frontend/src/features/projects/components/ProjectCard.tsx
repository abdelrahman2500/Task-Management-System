import { FolderKanban, CheckSquare, Users } from "lucide-react";
import type { Project } from "../types";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { can } from "../../../shared/permissions/can";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

const statusVariant: Record<
  string,
  "success" | "info" | "default" | "warning"
> = {
  ACTIVE: "success",
  COMPLETED: "info",
  ARCHIVED: "default",
};

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const { data: currentUser } = useCurrentUser();

  // Owner + global admins can edit/delete
  const canWrite = can(currentUser, "update", "projects", {
    ownerId: project.ownerId,
    currentUserId: currentUser?.id,
  });

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <FolderKanban className="h-6 w-6" />
        </div>
        <Badge variant={statusVariant[project.status] ?? "default"} size="sm">
          {project.status}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
        {project.name}
      </h3>

      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">
        {project.description ?? "No description provided."}
      </p>

      {/* Meta counts */}
      {project._count && (
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckSquare size={13} />
            {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {project._count.members} member
            {project._count.members !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </p>

      {canWrite && (
        <div className="mt-5 flex gap-3">
          <Button
            className="flex-1"
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
      )}
    </div>
  );
}
