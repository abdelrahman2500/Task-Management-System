import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../api/settings.service";
import { settingsKeys } from "../constants/settingsKeys";

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: ({ signal }) => settingsService.getPreferences({ signal }),
    staleTime: 1000 * 60 * 5,
  });
}
