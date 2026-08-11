import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../api/settings.service";
import { settingsKeys } from "../constants/settingsKeys";

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: () => settingsService.getPreferences(),
    staleTime: 1000 * 60 * 5,
  });
}
