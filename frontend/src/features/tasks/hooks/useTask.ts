import { useQuery } from "@tanstack/react-query";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";

export function useTask(taskId: number) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskServices.getTaskById(taskId),
    enabled: !!taskId,
  });
}
