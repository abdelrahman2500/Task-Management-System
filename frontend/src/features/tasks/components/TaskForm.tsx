import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormData } from "../schemas/task.schema";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { useProjects } from "../../projects/hooks/useProjects";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormData>;
  loading?: boolean;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
}

const selectClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white text-sm";

export function TaskForm({
  defaultValues,
  loading = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const { data: projects } = useProjects();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "TODO",
      priority: defaultValues?.priority ?? "MEDIUM",
      assigneeId: defaultValues?.assigneeId ?? null,
      projectId: defaultValues?.projectId,
      dueDate: defaultValues?.dueDate ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <Input
        id="task-title"
        label="Title"
        placeholder="Fix login bug"
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Describe the task..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select id="task-status" className={selectClass} {...register("status")}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select id="task-priority" className={selectClass} {...register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {errors.priority && (
            <p className="text-sm text-red-500">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Project */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Project
        </label>
        <select
          id="task-project"
          className={selectClass}
          {...register("projectId", { valueAsNumber: true })}
        >
          <option value="">Select a project...</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-sm text-red-500">{errors.projectId.message}</p>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Due Date
        </label>
        <input
          id="task-due-date"
          type="date"
          className={selectClass}
          {...register("dueDate")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="w-auto">
          Save Task
        </Button>
      </div>
    </form>
  );
}
