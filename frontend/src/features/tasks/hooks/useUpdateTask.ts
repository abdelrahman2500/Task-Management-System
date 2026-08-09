import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { Task, UpdateTaskRequest } from "../types";

interface UpdateTaskVariables {
  taskId: number;
  data: UpdateTaskRequest;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskVariables) =>
      taskServices.updateTask(taskId, data),

    onMutate: async ({ taskId, data }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update.
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });

      const previousTask = queryClient.getQueryData<Task>(
        taskKeys.detail(taskId),
      );

      // Optimistically merge the incoming patch into the cached task.
      queryClient.setQueryData<Task>(taskKeys.detail(taskId), (old) =>
        old ? { ...old, ...data } : old,
      );

      return { previousTask };
    },

    onError: (_error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask);
      }
      toast.error("Failed to update task.");
    },

    onSuccess: (_data) => {
      toast.success("Task updated successfully.");
    },
    onSettled: (_data, _error, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(taskId),
      });

      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
    },
  });
}
