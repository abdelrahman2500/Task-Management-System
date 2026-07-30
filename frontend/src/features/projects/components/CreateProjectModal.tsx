import { useMutation, useQueryClient } from "@tanstack/react-query";
import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { ProjectForm } from "./ProjectForm";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const createProject = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
  return (
    <Dialog open={open} title="Create Project" onClose={onClose}>
      <ProjectForm
        loading={createProject.isPending}
        onCancel={onClose}
        onSubmit={(data) => {
          createProject.mutate(
            {
              ownerId: 1, // مؤقتًا، حتى نربطه بالمستخدم المسجل
              ...data,
            },
            {
              onSuccess: () => {
                onClose();
              },
            },
          );
        }}
      />
    </Dialog>
  );
}
