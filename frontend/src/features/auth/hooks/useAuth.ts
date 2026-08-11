import { useCurrentUser } from "./useCurrentUser";
import type { CurrentUser } from "../types";

export interface UseAuthResult {
  user: CurrentUser | undefined;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthResult {
  const { data, isLoading, isError } = useCurrentUser();

  return {
    user: data,
    isLoading,
    isError,
    isAuthenticated: !!data && data.isActive,
  };
}
