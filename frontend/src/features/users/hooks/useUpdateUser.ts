import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";
import type { UpdateUserRequest } from "../types";

interface UpdateUserVariables {
  userId: number;
  data: UpdateUserRequest;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateUserVariables) =>
      userService.updateUser(userId, data),

    onSuccess(_data, { userId }) {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update user.";
      toast.error(message);
    },
  });
}
