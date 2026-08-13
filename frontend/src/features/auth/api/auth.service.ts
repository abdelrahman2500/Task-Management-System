/**
 * Authentication service using generated OpenAPI types
 *
 * Handles login, logout, and current user fetching with generated types.
 * Supports AbortSignal propagation for request cancellation.
 */

import { apiClient } from "../../../shared/api/client";
import { tokenStorage } from "../../../shared/utils/token-storage";
import type { RequestOptions } from "../../../shared/api/cancellation";
import type { LoginRequest, User } from "../types";

export const authServices = {
  async login(
    data: LoginRequest,
    options?: RequestOptions,
  ): Promise<{ token: string; user: User }> {
    const result = await apiClient.auth.login(data, options);
    tokenStorage.setAccessToken(result.token);
    return result;
  },

  async getMe(options?: RequestOptions): Promise<User> {
    return apiClient.auth.getCurrentUser(options);
  },

  logout(): void {
    tokenStorage.removeAccessToken();
  },
};
