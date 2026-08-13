/**
 * User service using generated OpenAPI types
 *
 * Delegates to centralized API client for user-related operations.
 * Supports AbortSignal propagation for request cancellation.
 */

import { apiClient } from "../../../shared/api/client";
import type { RequestOptions } from "../../../shared/api/cancellation";
import type { User, PaginatedResponse } from "../types";
import type {
  RegisterRequest,
  ListProjectsParams,
} from "../../../shared/api/generated/types";

export const userService = {
  async getMe(options?: RequestOptions): Promise<User> {
    const result = await apiClient.auth.getCurrentUser(options);
    return result as User;
  },

  async updateMe(data: Partial<User>, options?: RequestOptions): Promise<User> {
    const result = await apiClient.auth.updateProfile(data, options);
    return result as User;
  },

  async listUsers(
    params?: ListProjectsParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<User>> {
    return apiClient.users.listUsers(params, options);
  },

  async getUser(userId: number, options?: RequestOptions): Promise<User> {
    const result = await apiClient.users.getUser(userId, options);
    return result as User;
  },

  async createUser(
    data: RegisterRequest,
    options?: RequestOptions,
  ): Promise<User> {
    const result = await apiClient.users.createUser(data, options);
    return result as User;
  },

  async updateUser(
    userId: number,
    data: Partial<User>,
    options?: RequestOptions,
  ): Promise<User> {
    const result = await apiClient.users.updateUser(userId, data, options);
    return result as User;
  },

  async deleteUser(userId: number, options?: RequestOptions): Promise<void> {
    return apiClient.users.deleteUser(userId, options);
  },
};
