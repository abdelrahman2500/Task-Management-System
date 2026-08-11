import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { CreateTaskRequest } from "../types";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskServices.createTask(data),

    onSuccess() {
      toast.success("Task created successfully.");
      // Bust every list regardless of filters — new task may appear in any of them
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create task.";
      toast.error(message);
    },
  });
}
