import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../tests/mocks/server";
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

beforeEach(() => {
  vi.clearAllMocks();
  (tokenStorage.getAccessToken as any).mockReturnValue(null);
});

describe("axios interceptors", () => {
  it("adds authorization header when token exists", async () => {
    (tokenStorage.getAccessToken as any).mockReturnValue("test-token");

    // Mock an endpoint to capture the request
    server.use(
      http.get("http://localhost:3000/api/v1/test", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        return HttpResponse.json({ success: true, data: { authHeader } });
      }),
    );

    const response: { authHeader: string | null } = await api.get("/test");
    expect(response.authHeader).toBe("Bearer test-token");
  });

  it("does not add authorization header when no token", async () => {
    (tokenStorage.getAccessToken as any).mockReturnValue(null);

    server.use(
      http.get("http://localhost:3000/api/v1/test", ({ request }) => {
        const authHeader = request.headers.get("authorization");
        return HttpResponse.json({ success: true, data: { authHeader } });
      }),
    );

    const response: { authHeader: string | null } = await api.get("/test");
    expect(response.authHeader).toBeNull();
  });

  it("handles 401 errors by clearing token", async () => {
    (tokenStorage.getAccessToken as any).mockReturnValue("expired-token");

    server.use(
      http.get("http://localhost:3000/api/v1/test", () => {
        return HttpResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Token expired" },
          },
          { status: 401 },
        );
      }),
    );

    try {
      await api.get("/test");
    } catch (error) {
      // Should have removed the token
      expect(tokenStorage.removeAccessToken).toHaveBeenCalled();
    }
  });

  it("handles network errors gracefully", async () => {
    server.use(
      http.get("http://localhost:3000/api/v1/test", () => {
        return HttpResponse.error();
      }),
    );

    await expect(api.get("/test")).rejects.toThrow();
  });

  it("transforms successful responses correctly", async () => {
    server.use(
      http.get("http://localhost:3000/api/v1/test", () => {
        return HttpResponse.json({
          success: true,
          data: { message: "Hello World" },
        });
      }),
    );

    const response = await api.get("/test");
    expect(response).toEqual({ message: "Hello World" });
  });

  it("handles API error responses", async () => {
    server.use(
      http.get("http://localhost:3000/api/v1/test", () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid input",
              details: { field: "email" },
            },
          },
          { status: 400 },
        );
      }),
    );

    try {
      await api.get("/test");
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
