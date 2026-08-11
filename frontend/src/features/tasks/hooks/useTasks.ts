import { useQuery } from "@tanstack/react-query";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";
import type { GetTasksParams } from "../types";

export function useTasks(params: GetTasksParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskServices.getTasks(params),
    placeholderData: (prev) => prev,
  });
}
