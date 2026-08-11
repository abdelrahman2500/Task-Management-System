import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { ProjectForm } from "./ProjectForm";
import { useCreateProject } from "../hooks/useCreateProject";
import type { ProjectFormData } from "../schemas/project.schema";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = (data: ProjectFormData) => {
    createProject(data, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog
      open={open}
      title="Create Project"
      onClose={onClose}
      closeDisabled={isPending}
    >
      <ProjectForm
        loading={isPending}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}
