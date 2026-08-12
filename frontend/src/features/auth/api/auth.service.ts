/**
 * Authentication service using generated OpenAPI types
 *
 * Handles login, logout, and current user fetching with generated types.
 */

import { apiClient } from "../../../shared/api/client";
import { tokenStorage } from "../../../shared/utils/token-storage";
import type { LoginRequest, User } from "../types";

export const authServices = {
  async login(data: LoginRequest): Promise<{ token: string; user: User }> {
    const result = await apiClient.auth.login(data);
    tokenStorage.setAccessToken(result.token);
    return result;
  },

  async getMe(): Promise<User> {
    return apiClient.auth.getCurrentUser();
  },

  logout(): void {
    tokenStorage.removeAccessToken();
  },
};
