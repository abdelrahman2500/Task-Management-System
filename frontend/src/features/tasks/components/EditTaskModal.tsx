import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { TaskForm } from "./TaskForm";
import type { TaskFormData } from "../schemas/task.schema";
import type { Task } from "../types";

interface EditTaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function EditTaskModal({
  open,
  task,
  onClose,
}: EditTaskModalProps) {
  const updateTask = useUpdateTask();

  if (!task) return null;

  const handleSubmit = (data: TaskFormData) => {
    updateTask.mutate(
      {
        taskId: task.id,
        data: {
          title: data.title,
          description: data.description ?? null,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId ?? null,
          dueDate: data.dueDate ?? null,
        },
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Dialog open={open} title="Edit Task" onClose={onClose}>
      <TaskForm
        defaultValues={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
          dueDate: task.dueDate,
        }}
        loading={updateTask.isPending}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
