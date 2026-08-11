import { api } from "../../../shared/api/axios";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdatePreferencesRequest,
  AccountInfo,
  UserPreferences,
} from "../types";
import type { User } from "../../users/types";

export const settingsService = {
  async getProfile(): Promise<User> {
    return api.get<User>("/settings/profile") as unknown as Promise<User>;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return api.patch<User>(
      "/settings/profile",
      data,
    ) as unknown as Promise<User>;
  },

  async getAccount(): Promise<AccountInfo> {
    return api.get<AccountInfo>(
      "/settings/account",
    ) as unknown as Promise<AccountInfo>;
  },

  async deactivateAccount(): Promise<void> {
    await api.delete("/settings/account");
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.patch("/settings/security/password", data);
  },

  async getPreferences(): Promise<UserPreferences> {
    return api.get<UserPreferences>(
      "/settings/preferences",
    ) as unknown as Promise<UserPreferences>;
  },

  async updatePreferences(
    data: UpdatePreferencesRequest,
  ): Promise<UserPreferences> {
    return api.patch<UserPreferences>(
      "/settings/preferences",
      data,
    ) as unknown as Promise<UserPreferences>;
  },
};
