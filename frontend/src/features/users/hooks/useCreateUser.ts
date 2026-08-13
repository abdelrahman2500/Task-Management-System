import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";
import type { CreateUserRequest } from "../types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),

    onSuccess() {
      toast.success("User created successfully.");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create user.";
      toast.error(message);
    },
  });
}
