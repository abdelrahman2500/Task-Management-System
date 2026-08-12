import { Button } from "../../../shared/components/ui/Button";
import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useDeleteProject } from "../hooks/useDeleteProject";

interface DeleteProjectDialogProps {
  open: boolean;
  projectId: number | null;
  projectName: string;
  onClose: () => void;
}
export default function DeleteProjectDialog({
  open,
  projectId,
  projectName,
  onClose,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();
  const handleDelete = () => {
    if (!projectId) return;

    deleteProject.mutate(projectId, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  return (
    <Dialog
      open={open}
      title="Delete Project"
      onClose={onClose}
      closeDisabled={deleteProject.isPending}
    >
      <div className="space-y-6">
        <p className="text-slate-600">
          Are you sure you want to delete
          <span className="font-semibold"> {projectName}</span>?
        </p>

        <p className="text-sm text-red-500">This action cannot be undone.</p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="w-auto"
            onClick={onClose}
            disabled={deleteProject.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            className="w-auto"
            loading={deleteProject.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
