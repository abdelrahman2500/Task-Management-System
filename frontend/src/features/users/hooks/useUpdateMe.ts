import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { authKeys } from "../../auth/constants/authKeys";
import type { UpdateMeRequest } from "../types";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => userService.updateMe(data as any), // UpdateMeRequest is subset of Partial<User>

    onSuccess() {
      toast.success("Profile updated successfully.");
      // Invalidate the current-user query so Navbar/Sidebar refresh
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      toast.error(message);
    },
  });
}
