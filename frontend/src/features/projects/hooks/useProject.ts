import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";

export function useProject(projectId: number | null) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? 0),
    queryFn: () => projectService.getById(projectId as number),
    enabled: !!projectId,
  });
}
