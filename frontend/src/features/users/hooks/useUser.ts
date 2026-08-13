import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";

export function useUser(userId: number | null) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? 0),
    queryFn: ({ signal }) => userService.getUser(userId as number, { signal }),
    enabled: !!userId,
  });
}
