import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { TaskForm } from "./TaskForm";
import type { TaskFormData } from "../schemas/task.schema";
import type { Task, UpdateTaskRequest } from "../types";

const toIsoDate = (value: string | null | undefined) =>
  value ? `${value}T00:00:00.000Z` : null;

interface EditTaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

function getUpdatePayload(task: Task, data: TaskFormData): UpdateTaskRequest {
  const payload: UpdateTaskRequest = {};
  const description = data.description?.trim() || null;
  const dueDate = toIsoDate(data.dueDate);

  if (data.title !== task.title) payload.title = data.title;
  if (description !== task.description) payload.description = description;
  if (data.status !== task.status) payload.status = data.status;
  if (data.priority !== task.priority) payload.priority = data.priority;
  if (data.assigneeId !== task.assigneeId) payload.assigneeId = data.assigneeId;
  // Note: projectId cannot be changed via update - it's part of task identity
  if ((data.dueDate || null) !== (task.dueDate?.slice(0, 10) ?? null)) {
    payload.dueDate = dueDate;
  }

  return payload;
}

export default function EditTaskModal({
  open,
  task,
  onClose,
}: EditTaskModalProps) {
  const updateTask = useUpdateTask();

  if (!task) return null;

  const handleSubmit = (data: TaskFormData) => {
    const payload = getUpdatePayload(task, data);
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateTask.mutate(
      {
        taskId: task.id,
        data: payload,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Dialog
      open={open}
      title="Edit Task"
      onClose={onClose}
      closeDisabled={updateTask.isPending}
    >
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
