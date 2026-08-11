import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),

    onSuccess(_data, userId) {
      toast.success("User deactivated successfully.");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to deactivate user.";
      toast.error(message);
    },
  });
}
