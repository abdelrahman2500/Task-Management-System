import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";
import type { CreateProjectRequest } from "../types";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateProjectRequest, "ownerId">) =>
      projectService.createProject(data),

    onSuccess() {
      toast.success("Project created successfully.");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create project.";
      toast.error(message);
    },
  });
}
