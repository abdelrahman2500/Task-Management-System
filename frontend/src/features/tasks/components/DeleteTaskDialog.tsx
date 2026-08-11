import { Button } from "../../../shared/components/ui/Button";
import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { AlertTriangle } from "lucide-react";
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
  const isDeleting = deleteTask.isPending;

  const handleClose = () => {
    if (!isDeleting) onClose();
  };

  const handleDelete = () => {
    if (!task) return;

    deleteTask.mutate(task.id, {
      onSuccess: () => onClose(),
    });
  };

  if (!task) return null;

  return (
    <Dialog open={open} title="Delete task" onClose={handleClose} closeDisabled={isDeleting}>
      <div className="space-y-6">
        <div className="flex gap-3">
          <span className="rounded-full bg-red-100 p-2 text-red-600" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>
          <div>
            <p className="font-medium text-slate-900">
              Delete <span className="break-words">“{task.title}”</span>?
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This permanently removes the task. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="w-auto" disabled={isDeleting} onClick={handleClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            className="w-auto"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            Delete task
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
