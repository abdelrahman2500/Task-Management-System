import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";

import { projectSchema, type ProjectFormData } from "../schemas/project.schema";

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  loading?: boolean;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
}

export function ProjectForm({
  defaultValues,
  loading = false,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "active",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={loading} className="space-y-6">
        <Input
          label="Project Name"
          placeholder="Task Manager"
          error={errors.name?.message}
          {...register("name")}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            rows={4}
            placeholder="Write a short description..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            {...register("description")}
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            {...register("status")}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="w-auto"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          <Button type="submit" loading={loading} className="w-auto">
            Save Project
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
