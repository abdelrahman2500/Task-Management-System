import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import toast from "react-hot-toast";
import { projectKeys } from "../constants/queryKeys";
import type { Project } from "../types";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.all,
      );
      queryClient.setQueryData<Project[]>(projectKeys.all, (old) =>
        old?.filter((p) => p.id !== id),
      );
      return { previousProjects };
    },

    onError: (_error, _id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.all, context.previousProjects);
      }
      toast.error("Failed to delete project.");
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },
  });
};
