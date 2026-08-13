import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../api/settings.service";
import { settingsKeys } from "../constants/settingsKeys";

export function useAccountInfo() {
  return useQuery({
    queryKey: settingsKeys.account(),
    queryFn: ({ signal }) => settingsService.getAccount({ signal }),
    staleTime: 1000 * 60 * 5,
  });
}
