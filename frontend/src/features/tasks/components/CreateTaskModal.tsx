import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useCreateTask } from "../hooks/useCreateTask";
import { TaskForm } from "./TaskForm";
import type { TaskFormData } from "../schemas/task.schema";

const toIsoDate = (value: string | null | undefined) =>
  value ? `${value}T00:00:00.000Z` : null;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  open,
  onClose,
}: CreateTaskModalProps) {
  const createTask = useCreateTask();

  const handleSubmit = (data: TaskFormData) => {
    createTask.mutate(
      {
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId ?? null,
        projectId: data.projectId,
        dueDate: toIsoDate(data.dueDate),
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Dialog
      open={open}
      title="New Task"
      onClose={onClose}
      closeDisabled={createTask.isPending}
    >
      <TaskForm
        loading={createTask.isPending}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
