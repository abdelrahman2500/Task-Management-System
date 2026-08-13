import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";
import type { ListProjectsParams, Project } from "../types";
import type { ProjectsResponse } from "../../../shared/api/generated/types";

export function useProjects(
  params?: ListProjectsParams,
): UseQueryResult<ProjectsResponse & { data: Project[] }, Error> {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: ({ signal }) => projectService.getProjects(params, { signal }),
    placeholderData: (prev) => prev,
  });
}
