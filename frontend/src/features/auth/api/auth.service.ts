import { api } from "../../../shared/api/axios";
import { tokenStorage } from "../../../shared/utils/token-storage";
import type { LoginRequest, LoginResponse } from "../types";

export const authServices = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data);

    tokenStorage.setAccessToken(response.data.data.token);

    return response.data;
  },

  logout() {
    tokenStorage.removeAccessToken();
  },
};
