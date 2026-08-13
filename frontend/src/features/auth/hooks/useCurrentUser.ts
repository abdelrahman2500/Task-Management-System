import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authServices } from "../api/auth.service";
import { authKeys } from "../constants/authKeys";
import { tokenStorage } from "../../../shared/utils/token-storage";
import type { CurrentUser } from "../types";

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => authServices.getMe({ signal }),
    // Only attempt the request when a token exists
    enabled: !!tokenStorage.getAccessToken(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: unknown) => {
      // Don't retry 401 — user is simply not authenticated
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useCurrentUserSafe(): CurrentUser | null {
  const { data } = useCurrentUser();
  return data ?? null;
}

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: authKeys.me() });
}
