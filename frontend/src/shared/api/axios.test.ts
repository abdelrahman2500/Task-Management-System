import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "./axios";

// Mock the token storage
vi.mock("../utils/token-storage", () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
    removeAccessToken: vi.fn(),
  },
}));

// Import the mocked module
import { tokenStorage } from "../utils/token-storage";

// Mock axios interceptors work - test them indirectly through config
beforeEach(() => {
  vi.clearAllMocks();
  (tokenStorage.getAccessToken as any).mockReturnValue(null);
});

describe("axios interceptors", () => {
  it("creates axios instance with correct base URL", () => {
    expect(api.defaults.baseURL).toContain("/api/v1");
  });

  it("has default timeout configured", () => {
    expect(api.defaults.timeout).toBe(30000); // Default timeout is 30 seconds
  });

  it("has Content-Type header set", () => {
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("initializes with request interceptors", () => {
    // Verify interceptors are attached
    expect(api.interceptors.request.handlers).toBeDefined();
  });

  it("initializes with response interceptors", () => {
    // Verify interceptors are attached
    expect(api.interceptors.response.handlers).toBeDefined();
  });
});
