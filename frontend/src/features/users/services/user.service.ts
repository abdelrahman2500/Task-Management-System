/**
 * User service using generated OpenAPI types
 *
 * Delegates to centralized API client for user-related operations.
 */

import { apiClient } from "../../../shared/api/client";
import type { User, PaginatedResponse } from "../types";
import type {
  RegisterRequest,
  ListProjectsParams,
} from "../../../shared/api/generated/types";

export const userService = {
  async getMe(): Promise<User> {
    const result = await apiClient.users.getMe();
    return result as User;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const result = await apiClient.users.updateMe(data);
    return result as User;
  },

  async listUsers(
    params?: ListProjectsParams,
  ): Promise<PaginatedResponse<User>> {
    return apiClient.users.listUsers(params);
  },

  async getUser(userId: number): Promise<User> {
    const result = await apiClient.users.getUser(userId);
    return result as User;
  },

  async createUser(data: RegisterRequest): Promise<User> {
    const result = await apiClient.users.createUser(data);
    return result as User;
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const result = await apiClient.users.updateUser(userId, data);
    return result as User;
  },

  async deleteUser(userId: number): Promise<void> {
    return apiClient.users.deleteUser(userId);
  },
};
