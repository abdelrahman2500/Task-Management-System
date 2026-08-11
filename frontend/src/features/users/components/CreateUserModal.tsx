import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Dialog } from "../../../shared/components/ui/Dialog";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { Switch } from "../../../shared/components/ui/Switch";
import { Button } from "../../../shared/components/ui/Button";

import {
  createUserSchema,
  type CreateUserFormData,
} from "../schemas/user.schema";
import { useCreateUser } from "../hooks/useCreateUser";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        email: "",
        password: "",
        role: "MEMBER",
        isActive: true,
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateUserFormData) => {
    await createUser(data, { onSuccess: onClose });
  };

  return (
    <Dialog
      open={open}
      title="Create New User"
      onClose={onClose}
      closeDisabled={isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Temporary Password"
          type="password"
          placeholder="Min 8 chars, uppercase, number, special"
          error={errors.password?.message}
          {...register("password")}
        />

        <Select
          label="Role"
          error={errors.role?.message}
          value={watch("role")}
          onChange={(e) =>
            setValue("role", e.target.value as CreateUserFormData["role"])
          }
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
          <option value="VIEWER">Viewer</option>
        </Select>

        <Switch
          label="Active account"
          checked={watch("isActive") ?? true}
          onChange={(checked) => setValue("isActive", checked)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-auto"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="w-auto">
            Create User
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
