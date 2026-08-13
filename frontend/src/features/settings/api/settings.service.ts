import { apiClient } from "../../../shared/api/client";
import type { RequestOptions } from "../../../shared/api/cancellation";
import type { UpdateProfileRequest, ChangePasswordRequest } from "../types";
import type { User } from "../../users/types";

// Placeholder types - these should match backend response types
interface AccountInfo extends User {
  // Account-specific fields would go here
}

interface UserPreferences {
  // Preferences structure
  [key: string]: any;
}

export const settingsService = {
  async getProfile(options?: RequestOptions): Promise<User> {
    return apiClient.auth.getCurrentUser(options);
  },

  async updateProfile(
    data: UpdateProfileRequest,
    options?: RequestOptions,
  ): Promise<User> {
    return apiClient.auth.updateProfile(data, options);
  },

  async changePassword(
    data: ChangePasswordRequest,
    options?: RequestOptions,
  ): Promise<void> {
    await apiClient.auth.changePassword(data, options);
  },

  async getAccount(options?: RequestOptions): Promise<AccountInfo> {
    // This would call a settings-specific endpoint if available
    // For now, fall back to getting current user profile
    const user = await apiClient.auth.getCurrentUser(options);
    return user as AccountInfo;
  },

  async getPreferences(options?: RequestOptions): Promise<UserPreferences> {
    // This would call a settings-specific endpoint if available
    // For now, return empty preferences
    // TODO: Implement when backend endpoint is integrated
    return {} as UserPreferences;
  },
};
