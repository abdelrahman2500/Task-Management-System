import { useQuery } from "@tanstack/react-query";
import { taskServices } from "../api/task.service";
import { taskKeys } from "../constants/queryKeys";

export function useTask(taskId: number | null) {
  return useQuery({
    queryKey: taskKeys.detail(taskId ?? 0),
    queryFn: () => taskServices.getTaskById(taskId as number),
    enabled: !!taskId,
  });
}
