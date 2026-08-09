import { Button } from "../../../shared/components/ui/Button";
import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useDeleteTask } from "../hooks/useDeleteTask";
import type { Task } from "../types";

interface DeleteTaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function DeleteTaskDialog({
  open,
  task,
  onClose,
}: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    if (!task) return;

    deleteTask.mutate(task.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} title="Delete Task" onClose={onClose}>
      <div className="space-y-6">
        <p className="text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold">"{task?.title}"</span>?
        </p>

        <p className="text-sm text-red-500">This action cannot be undone.</p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="w-auto" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            className="w-auto"
            loading={deleteTask.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
