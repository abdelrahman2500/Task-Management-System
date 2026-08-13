import { apiClient } from "../../../shared/api/client";
import type { UpdateProfileRequest, ChangePasswordRequest } from "../types";
import type { User } from "../../users/types";

export const settingsService = {
  async getProfile(): Promise<User> {
    return apiClient.auth.getCurrentUser();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.auth.updateProfile(data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.auth.changePassword(data);
  },
};
