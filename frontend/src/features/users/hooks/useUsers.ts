import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";
import type { ListUsersParams } from "../types";

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.listUsers(params),
    placeholderData: (previousData) => previousData,
  });
}
