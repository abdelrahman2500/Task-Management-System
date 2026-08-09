import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { Task } from "../types";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => taskServices.deleteTask(taskId),

    onMutate: async (taskId) => {
      // Cancel any in-flight list refetches.
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Snapshot every list currently in cache so we can roll back on error.
      const previousLists = queryClient.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      // Optimistically remove the task from every cached list.
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
        old?.filter((task) => task.id !== taskId),
      );

      return { previousLists };
    },

    onError: (_error, _taskId, context) => {
      // Restore all lists to their pre-mutation snapshot.
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete task.");
    },

    onSuccess: (_data, taskId) => {
      toast.success("Task deleted successfully.");

      // Remove the stale detail entry from cache entirely.
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
    },

    onSettled: () => {
      // Always re-sync lists with the server after settle (success or error).
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
