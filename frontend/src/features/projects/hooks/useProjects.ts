import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";
import type { ListProjectsParams } from "../types";

export function useProjects(params?: ListProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
    placeholderData: (prev) => prev,
  });
}
