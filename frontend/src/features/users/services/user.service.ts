import { api } from "../../../shared/api/axios";
import type {
  User,
  CreateUserRequest,
  UpdateMeRequest,
  UpdateUserRequest,
  ListUsersParams,
  ListUsersResponse,
} from "../types";

export const userService = {
  async getMe(): Promise<User> {
    // Interceptor unwraps { success, data } → data (which is the SafeUser object)
    return api.get<User>("/users/me") as unknown as Promise<User>;
  },

  async updateMe(data: UpdateMeRequest): Promise<User> {
    return api.patch<User>("/users/me", data) as unknown as Promise<User>;
  },

  async listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
    return api.get<ListUsersResponse>("/users", {
      params,
    }) as unknown as Promise<ListUsersResponse>;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return api.post<User>("/users", data) as unknown as Promise<User>;
  },

  async getUser(userId: number): Promise<User> {
    return api.get<User>(`/users/${userId}`) as unknown as Promise<User>;
  },

  async updateUser(userId: number, data: UpdateUserRequest): Promise<User> {
    return api.patch<User>(
      `/users/${userId}`,
      data,
    ) as unknown as Promise<User>;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}`);
  },
};
