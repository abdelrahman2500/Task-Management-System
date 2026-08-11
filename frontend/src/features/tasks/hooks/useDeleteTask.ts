import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { ListTasksResponse } from "../types";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => taskServices.deleteTask(taskId),

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = queryClient.getQueriesData<ListTasksResponse>({
        queryKey: taskKeys.lists(),
      });

      // Optimistically remove from every cached list
      queryClient.setQueriesData<ListTasksResponse>(
        { queryKey: taskKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.filter((t) => t.id !== taskId),
                total: Math.max(0, old.total - 1),
              }
            : old,
      );

      return { previousLists };
    },

    onError(_error, _taskId, context) {
      // Rollback all lists
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete task.");
    },

    onSuccess(_data, taskId) {
      toast.success("Task deleted successfully.");
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
