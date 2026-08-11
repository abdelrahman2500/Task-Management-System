import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { settingsService } from "../api/settings.service";
import type { ChangePasswordRequest } from "../types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      settingsService.changePassword(data),

    onSuccess() {
      toast.success("Password changed successfully.");
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to change password.";
      toast.error(message);
    },
  });
}
