import { useQuery } from "@tanstack/react-query";
import { projectService } from "../services/project.service";
import { projectKeys } from "../constants/queryKeys";

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,

    queryFn: () => projectService.getProjects(),
  });
}
