import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { settingsService } from "../api/settings.service";
import { settingsKeys } from "../constants/settingsKeys";
import { authKeys } from "../../auth/constants/authKeys";
import type { UpdateProfileRequest } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      settingsService.updateProfile(data),

    onSuccess() {
      toast.success("Profile updated successfully.");
      // Refresh current user in auth cache (Navbar, Sidebar)
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      toast.error(message);
    },
  });
}
