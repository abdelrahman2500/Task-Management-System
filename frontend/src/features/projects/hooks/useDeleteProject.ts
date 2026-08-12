import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";
import type { ListProjectsResponse } from "../types";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),

    onMutate: async (id): Promise<{ previousData: any[] }> => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      const previousData = queryClient.getQueriesData<ListProjectsResponse>({
        queryKey: projectKeys.lists(),
      });

      // Optimistically remove from every cached list
      queryClient.setQueriesData<ListProjectsResponse>(
        { queryKey: projectKeys.lists() },
        (old: ListProjectsResponse | undefined) =>
          old
            ? {
                ...old,
                data: old.data.filter((p) => p.id !== id),
                pagination: {
                  ...old.pagination,
                  total: Math.max(0, old.pagination.total - 1),
                },
              }
            : old,
      );

      return { previousData };
    },

    onError(_error, _id, context) {
      // Rollback
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete project.");
    },

    onSuccess(_data, id) {
      toast.success("Project deleted successfully.");
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
