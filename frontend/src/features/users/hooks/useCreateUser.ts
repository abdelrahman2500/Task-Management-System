import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
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

    onError(error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message ?? "Failed to create user.");
    },
  });
}
