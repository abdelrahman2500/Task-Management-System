import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskServices.createTask,

    onSuccess() {
      toast.success("Task created successfully.");

      // Bust every list regardless of filters — new task may appear in any of them.
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },

    onError() {
      toast.error("Failed to create task.");
    },
  });
}
