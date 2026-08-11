import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { settingsService } from "../api/settings.service";
import { settingsKeys } from "../constants/settingsKeys";
import type { UpdatePreferencesRequest, UserPreferences } from "../types";

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) =>
      settingsService.updatePreferences(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.preferences() });
      const previous = queryClient.getQueryData<UserPreferences>(
        settingsKeys.preferences(),
      );
      if (previous) {
        queryClient.setQueryData<UserPreferences>(settingsKeys.preferences(), {
          ...previous,
          ...data,
        });
      }
      return { previous };
    },

    onSuccess() {
      toast.success("Preferences saved.");
    },

    onError(_error, _data, context) {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.preferences(), context.previous);
      }
      toast.error("Failed to save preferences.");
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: settingsKeys.preferences() });
    },
  });
}
