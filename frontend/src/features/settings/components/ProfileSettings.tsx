import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Avatar } from "../../../shared/components/ui/Avatar";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "../schemas/settings.schema";

export function ProfileSettings() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", email: "" },
  });

  // Populate form once user loads
  useEffect(() => {
    if (currentUser) {
      reset({ name: currentUser.name, email: currentUser.email });
    }
  }, [currentUser, reset]);

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => reset(data),
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-4">
        {currentUser && <Avatar name={currentUser.name} size="xl" />}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-500">
            Update your name and email address.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        <Input
          id="profile-name"
          label="Full Name"
          placeholder="Your name"
          error={errors.name?.message}
          disabled={isPending}
          {...register("name")}
        />
        <Input
          id="profile-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          disabled={isPending}
          {...register("email")}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-auto"
            loading={isPending}
            disabled={!isDirty || isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
