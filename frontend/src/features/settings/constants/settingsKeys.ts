export const settingsKeys = {
  all: ["settings"] as const,
  profile: () => [...settingsKeys.all, "profile"] as const,
  account: () => [...settingsKeys.all, "account"] as const,
  preferences: () => [...settingsKeys.all, "preferences"] as const,
};
