import axios, { type AxiosInstance } from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { tokenStorage } from "../utils/token-storage";
import { getConfiguredTimeout } from "./cancellation";

let queryClientRef: QueryClient | null = null;
let isRedirecting = false;

export function setQueryClientReference(client: QueryClient): void {
  queryClientRef = client;
}

export const api: AxiosInstance = axios.create({
  baseURL:
    (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000") + "/api/v1",
  timeout: getConfiguredTimeout(),
  headers: {
    "Content-Type": "application/json",
  },
  // Use fetch adapter to support MSW in tests
  adapter: typeof window !== "undefined" ? "fetch" : "http",
});

// Attach bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Unwrap the standard { success, data } envelope and handle 401
api.interceptors.response.use(
  (response) => {
    // If the server returns { success, data }, unwrap to data.
    // Some endpoints return { success, data: { ...fields } } and some
    // return { success, data: [ ...items ] }.
    const body = response.data;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      return body.data;
    }
    return body;
  },
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const status = error.response?.status;

    if (status === 401 && !isLoginRequest && !isRedirecting) {
      isRedirecting = true;
      tokenStorage.removeAccessToken();
      if (queryClientRef) {
        queryClientRef.clear();
      }
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
      setTimeout(() => {
        isRedirecting = false;
      }, 1_000);
    }

    // Surface the server error message for toast/display
    const serverError = error.response?.data;
    if (serverError && typeof serverError === "object") {
      const message =
        serverError?.error?.message ?? serverError?.message ?? error.message;
      return Promise.reject(Object.assign(error, { message }));
    }

    return Promise.reject(error);
  },
);
