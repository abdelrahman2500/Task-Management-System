import { api } from "../../../shared/api/axios";
import { tokenStorage } from "../../../shared/utils/token-storage";
import type { LoginRequest, CurrentUser } from "../types";

export const authServices = {
  async login(
    data: LoginRequest,
  ): Promise<{ token: string; user: CurrentUser }> {
    // The axios interceptor unwraps response.data → so the resolved value is
    // already the inner "data" payload: { token, user }
    const payload = await api.post<{ token: string; user: CurrentUser }>(
      "/auth/login",
      data,
    );
    // payload IS { token, user } after the interceptor unwrap
    const result = payload as unknown as { token: string; user: CurrentUser };
    tokenStorage.setAccessToken(result.token);
    return result;
  },

  async getMe(): Promise<CurrentUser> {
    // Interceptor unwraps to { id, name, email, role, ... }
    const user = await api.get<CurrentUser>("/users/me");
    return user as unknown as CurrentUser;
  },

  logout(): void {
    tokenStorage.removeAccessToken();
  },
};
