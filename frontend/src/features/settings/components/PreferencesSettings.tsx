import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { SlidersHorizontal } from "lucide-react";
import { usePreferences } from "../hooks/usePreferences";
import { useUpdatePreferences } from "../hooks/useUpdatePreferences";
import { Switch } from "../../../shared/components/ui/Switch";
import { Select } from "../../../shared/components/ui/Select";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import type { UpdatePreferencesRequest } from "../types";

type FormData = Required<UpdatePreferencesRequest>;

export function PreferencesSettings() {
  const { data: preferences, isLoading } = usePreferences();
  const { mutate: updatePreferences, isPending } = useUpdatePreferences();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormData>({
    defaultValues: {
      theme: "light",
      language: "en",
      emailNotifications: true,
      taskNotifications: true,
      projectNotifications: true,
    },
  });

  useEffect(() => {
    if (preferences) {
      reset({
        theme: preferences.theme,
        language: preferences.language,
        emailNotifications: preferences.emailNotifications,
        taskNotifications: preferences.taskNotifications,
        projectNotifications: preferences.projectNotifications,
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: FormData) => {
    updatePreferences(data, { onSuccess: () => reset(data) });
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
          <SlidersHorizontal size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
          <p className="text-sm text-slate-500">
            Customize your app experience.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        {/* Appearance */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Appearance
          </h3>
          <div className="space-y-4">
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Select
                  label="Theme"
                  id="pref-theme"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              )}
            />
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  label="Language"
                  id="pref-language"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </h3>
          <div className="space-y-4">
            <Controller
              name="emailNotifications"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Email notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </div>
              )}
            />
            <Controller
              name="taskNotifications"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Task notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Get notified about task changes
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </div>
              )}
            />
            <Controller
              name="projectNotifications"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Project notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Get notified about project updates
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-auto"
            loading={isPending}
            disabled={!isDirty || isPending}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}
