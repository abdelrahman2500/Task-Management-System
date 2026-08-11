import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";
import type { UpdateProjectRequest } from "../types";

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) =>
      projectService.updateProject(id, data),

    onSuccess(_data, { id }) {
      toast.success("Project updated successfully.");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },

    onError(error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update project.";
      toast.error(message);
    },
  });
}
