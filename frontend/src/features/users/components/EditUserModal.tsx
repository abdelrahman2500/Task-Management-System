import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Dialog } from "../../../shared/components/ui/Dialog";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { Switch } from "../../../shared/components/ui/Switch";
import { Button } from "../../../shared/components/ui/Button";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { can } from "../../../shared/permissions/can";
import {
  updateUserSchema,
  type UpdateUserFormData,
} from "../schemas/user.schema";
import { useUpdateUser } from "../hooks/useUpdateUser";
import type { User } from "../types";

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function EditUserModal({ open, user, onClose }: EditUserModalProps) {
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const isAdmin = can(currentUser, "delete", "users");
  const isSelfEdit = currentUser?.id === user?.id;
  const canEditRole = isAdmin && !isSelfEdit;
  const canEditStatus = isAdmin;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      isActive: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: canEditRole ? user.role : undefined,
        isActive: canEditStatus ? user.isActive : undefined,
      });
    }
  }, [user, reset, canEditRole, canEditStatus]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    await updateUser(
      {
        userId: user.id,
        data: {
          name: data.name,
          email: data.email,
          ...(canEditRole && { role: data.role }),
          ...(canEditStatus && { isActive: data.isActive }),
        },
      },
      { onSuccess: onClose },
    );
  };

  const isActiveValue = watch("isActive");

  return (
    <Dialog
      open={open}
      title="Edit User"
      onClose={onClose}
      closeDisabled={isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {canEditRole && (
          <Select
            label="Role"
            error={errors.role?.message}
            value={watch("role") ?? user?.role ?? ""}
            onChange={(e) =>
              setValue("role", e.target.value as UpdateUserFormData["role"])
            }
          >
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </Select>
        )}

        {canEditStatus && (
          <Switch
            label="Active account"
            checked={isActiveValue ?? user?.isActive ?? true}
            onChange={(checked) => setValue("isActive", checked)}
          />
        )}

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
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
