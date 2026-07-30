import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,

    onSuccess() {
      toast.success("Project created successfully.");

      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },

    onError() {
      toast.error("Failed to create project.");
    },
  });
}
