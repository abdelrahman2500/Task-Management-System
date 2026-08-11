import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Check } from "lucide-react";
import { useChangePassword } from "../hooks/useChangePassword";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/settings.schema";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^\p{L}\p{N}]/u.test(p),
  },
];

export function SecuritySettings() {
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPassword = watch("newPassword") ?? "";

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          <p className="text-sm text-slate-500">Change your password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        <Input
          id="current-password"
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          autoComplete="current-password"
          disabled={isPending}
          {...register("currentPassword")}
        />

        <Input
          id="new-password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          autoComplete="new-password"
          disabled={isPending}
          {...register("newPassword")}
        />

        {/* Password strength checklist */}
        {newPassword.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {PASSWORD_RULES.map(({ label, test }) => {
              const pass = test(newPassword);
              return (
                <li
                  key={label}
                  className={`flex items-center gap-2 text-sm ${
                    pass ? "text-green-600" : "text-slate-500"
                  }`}
                >
                  <Check
                    size={14}
                    className={pass ? "text-green-600" : "text-slate-300"}
                    strokeWidth={3}
                  />
                  {label}
                </li>
              );
            })}
          </ul>
        )}

        <Input
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          autoComplete="new-password"
          disabled={isPending}
          {...register("confirmNewPassword")}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-auto"
            loading={isPending}
            disabled={isPending}
          >
            Change Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
