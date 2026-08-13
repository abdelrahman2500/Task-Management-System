import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { userKeys } from "../constants/userKeys";
import type { ListUsersParams, User, ListUsersResponse } from "../types";

export function useUsers(
  params: ListUsersParams = {},
): UseQueryResult<ListUsersResponse & { data: User[] }, Error> {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => userService.listUsers(params, { signal }),
    placeholderData: (previousData) => previousData,
  });
}
