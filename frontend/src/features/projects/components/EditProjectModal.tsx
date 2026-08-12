import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { ProjectForm } from "./ProjectForm";
import type { Project } from "../types";
import type { ProjectFormData } from "../schemas/project.schema";
import { useUpdateProject } from "../hooks/useUpdateProject";

interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

export default function EditProjectModal({
  open,
  onClose,
  project,
}: EditProjectModalProps) {
  const updateProject = useUpdateProject();

  if (!project) return null;

  const handleSubmit = (data: ProjectFormData) => {
    updateProject.mutate(
      {
        id: project.id,
        data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  return (
    <Dialog
      open={open}
      title="Edit Project"
      onClose={onClose}
      closeDisabled={updateProject.isPending}
    >
      <ProjectForm
        defaultValues={{
          name: project.name,
          description: project.description ?? "",
          status: project.status,
        }}
        loading={updateProject.isPending}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
