/**
 * Users Feature Types
 *
 * Imports base User type from generated OpenAPI types.
 * Defines custom user management request/response types.
 */

import type {
  User as BaseUser,
  PaginatedResponse,
} from "../../../shared/api/generated/types";

export type { PaginatedResponse };

/**
 * User type extended with role for frontend use
 * Role is determined by ProjectMember entries, but we include it here
 * for UI display purposes (backend may return it in auth context)
 */
export interface User extends BaseUser {
  role?: string;
}

export interface UpdateMeRequest {
  name?: string;
  email?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export type ListUsersResponse = PaginatedResponse<User>;
