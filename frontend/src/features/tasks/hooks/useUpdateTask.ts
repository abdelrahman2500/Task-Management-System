import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { Task, UpdateTaskRequest, ListTasksResponse } from "../types";

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
      await Promise.all([
        queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) }),
        queryClient.cancelQueries({ queryKey: taskKeys.lists() }),
      ]);

      const previousTask = queryClient.getQueryData<Task>(
        taskKeys.detail(taskId),
      );
      const previousLists = queryClient.getQueriesData<ListTasksResponse>({
        queryKey: taskKeys.lists(),
      });

      // Optimistic update on detail
      queryClient.setQueryData<Task>(taskKeys.detail(taskId), (old) =>
        old ? { ...old, ...data } : old,
      );
      // Optimistic update on every list
      queryClient.setQueriesData<ListTasksResponse>(
        { queryKey: taskKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((t) =>
                  t.id === taskId ? { ...t, ...data } : t,
                ),
              }
            : old,
      );

      return { previousTask, previousLists };
    },

    onError(_error, { taskId }, context) {
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask);
      }
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to update task.");
    },

    onSuccess() {
      toast.success("Task updated successfully.");
    },

    onSettled(_data, _error, { taskId }) {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
