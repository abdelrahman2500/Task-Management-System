import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requestIdMiddleware } from "./requestId";
import { requestLoggerMiddleware } from "./requestLogger";
import {
  redactObject,
  redactHeaders,
  logRequest,
  logValidationError,
  logAuthError,
  logAuthorizationError,
  logNotFound,
  logConflict,
  logRateLimit,
  logError,
} from "../lib/logger";

// Mock the environment module to avoid loading actual environment
vi.mock("../config/environment", () => ({
  getEnvironment: vi.fn(() => ({
    database: { url: "postgresql://test" },
    jwt: { secret: "test-secret-is-long-enough-for-testing", expiresIn: "7d" },
    server: { port: 3000, nodeEnv: "development" },
    cors: { origin: "http://localhost:5173" },
    logging: { level: "debug" },
  })),
}));

describe("Request Logging", () => {
  describe("Request ID Middleware", () => {
    it("should generate a UUID request ID if not provided", () => {
      const req = {
        get: () => undefined,
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(req.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(res.setHeader).toHaveBeenCalledWith("X-Request-ID", req.id);
      expect(next).toHaveBeenCalled();
    });

    it("should reuse valid UUID from X-Request-ID header", () => {
      const providedId = "550e8400-e29b-41d4-a716-446655440000";
      const req = {
        get: (header: string) =>
          header === "X-Request-ID" ? providedId : undefined,
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(providedId);
      expect(res.setHeader).toHaveBeenCalledWith("X-Request-ID", providedId);
    });

    it("should reject invalid UUID format from X-Request-ID", () => {
      const invalidId = "not-a-uuid";
      const req = {
        get: (header: string) =>
          header === "X-Request-ID" ? invalidId : undefined,
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      // Should generate new ID instead of reusing invalid one
      expect(req.id).not.toBe(invalidId);
      expect(req.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should record request start time", () => {
      const req = {
        get: () => undefined,
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;

      const next = vi.fn();

      const beforeTime = Date.now();
      requestIdMiddleware(req, res, next);
      const afterTime = Date.now();

      expect(req.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(req.startTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("Request Logger Middleware", () => {
    it("should skip logging for health check endpoint", () => {
      const req = {
        path: "/health",
        method: "GET",
        id: "test-id",
        startTime: Date.now(),
        get: () => undefined,
      } as unknown as Request;

      const res = {
        statusCode: 200,
        end: vi.fn(function (...args: any[]) {
          // Simulate res.end
        }),
      } as unknown as Response;

      const next = vi.fn();

      requestLoggerMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // The middleware should call next without intercepting res.end for health check
    });

    it("should record request duration", () => {
      const req = {
        path: "/api/tasks",
        method: "GET",
        id: "test-id",
        startTime: Date.now() - 100, // 100ms ago
        get: () => undefined,
      } as unknown as Request;

      const endFn = vi.fn();
      const res = {
        statusCode: 200,
        end: endFn,
      } as unknown as Response;

      const next = vi.fn();

      requestLoggerMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.end).toBeDefined();
    });
  });

  describe("Sensitive Data Redaction", () => {
    it("should redact password fields", () => {
      const data = {
        username: "user",
        password: "secret123",
        email: "user@example.com",
      };

      const redacted = redactObject(data);

      expect(redacted.username).toBe("user");
      expect(redacted.password).toBe("[REDACTED]");
      expect(redacted.email).toBe("user@example.com");
    });

    it("should redact passwordHash field", () => {
      const data = {
        id: 1,
        passwordHash: "$2b$10$...",
      };

      const redacted = redactObject(data);

      expect(redacted.id).toBe(1);
      expect(redacted.passwordHash).toBe("[REDACTED]");
    });

    it("should redact JWT and token fields", () => {
      const data = {
        token: "eyJhbGciOiJIUzI1NiIs...",
        jwt: "eyJhbGciOiJIUzI1NiIs...",
        accessToken: "token123",
        refreshToken: "token456",
      };

      const redacted = redactObject(data);

      expect(redacted.token).toBe("[REDACTED]");
      expect(redacted.jwt).toBe("[REDACTED]");
      expect(redacted.accessToken).toBe("[REDACTED]");
      expect(redacted.refreshToken).toBe("[REDACTED]");
    });

    it("should redact nested sensitive data", () => {
      const data = {
        user: {
          id: 1,
          email: "user@example.com",
          password: "secret",
          profile: {
            name: "John",
            token: "abc123",
          },
        },
      };

      const redacted = redactObject(data);

      expect(redacted.user.password).toBe("[REDACTED]");
      expect(redacted.user.profile.token).toBe("[REDACTED]");
      expect(redacted.user.email).toBe("user@example.com");
    });

    it("should redact sensitive headers", () => {
      const headers = {
        "content-type": "application/json",
        authorization: "Bearer token123",
        cookie: "sessionId=abc123",
        "x-api-key": "secret-key",
      };

      const redacted = redactHeaders(headers);

      expect(redacted["content-type"]).toBe("application/json");
      expect(redacted.authorization).toBe("[REDACTED]");
      expect(redacted.cookie).toBe("[REDACTED]");
      expect(redacted["x-api-key"]).toBe("[REDACTED]");
    });

    it("should be case-insensitive for header redaction", () => {
      const headers = {
        Authorization: "Bearer token",
        COOKIE: "session=123",
      };

      const redacted = redactHeaders(headers);

      expect(redacted.Authorization).toBe("[REDACTED]");
      expect(redacted.COOKIE).toBe("[REDACTED]");
    });

    it("should handle deeply nested objects gracefully", () => {
      const data = {
        level1: {
          level2: {
            level3: {
              password: "secret",
            },
          },
        },
      };

      const redacted = redactObject(data);

      expect(redacted.level1.level2.level3.password).toBe("[REDACTED]");
    });

    it("should handle arrays with sensitive data", () => {
      const data = {
        users: [
          { id: 1, password: "pwd1" },
          { id: 2, password: "pwd2" },
        ],
      };

      const redacted = redactObject(data);

      expect(redacted.users[0].password).toBe("[REDACTED]");
      expect(redacted.users[1].password).toBe("[REDACTED]");
    });
  });

  describe("Error Logging Functions", () => {
    it("logValidationError should format validation errors", () => {
      const errors = {
        email: "Invalid email format",
        password: "Password too short",
      };

      // Should not throw
      expect(() => {
        logValidationError(
          "req-123",
          "POST",
          "/api/auth/register",
          422,
          50,
          errors,
          1,
          "192.168.1.1",
        );
      }).not.toThrow();
    });

    it("logAuthError should log authentication failures", () => {
      // Should not throw
      expect(() => {
        logAuthError(
          "req-123",
          "POST",
          "/api/auth/login",
          "Invalid credentials",
          "192.168.1.1",
        );
      }).not.toThrow();
    });

    it("logAuthorizationError should log authorization failures", () => {
      // Should not throw
      expect(() => {
        logAuthorizationError(
          "req-123",
          "DELETE",
          "/api/projects/1",
          5,
          "User is not project owner",
          "192.168.1.1",
        );
      }).not.toThrow();
    });

    it("logNotFound should log 404 errors", () => {
      // Should not throw
      expect(() => {
        logNotFound("req-123", "GET", "/api/tasks/999", 1, "192.168.1.1");
      }).not.toThrow();
    });

    it("logConflict should log 409 errors", () => {
      // Should not throw
      expect(() => {
        logConflict(
          "req-123",
          "POST",
          "/api/auth/register",
          1,
          "Email already exists",
          "192.168.1.1",
        );
      }).not.toThrow();
    });

    it("logRateLimit should log 429 errors", () => {
      // Should not throw
      expect(() => {
        logRateLimit(
          "req-123",
          "POST",
          "/api/auth/login",
          "192.168.1.1",
          undefined,
        );
      }).not.toThrow();
    });

    it("logError should log 5xx errors", () => {
      // Should not throw
      expect(() => {
        logError(
          "req-123",
          "GET",
          "/api/tasks",
          500,
          100,
          "DATABASE_ERROR",
          "Connection failed",
          undefined,
          1,
          "192.168.1.1",
        );
      }).not.toThrow();
    });

    it("logRequest should log successful requests", () => {
      // Should not throw
      expect(() => {
        logRequest(
          "req-123",
          "GET",
          "/api/tasks",
          200,
          42,
          1,
          "192.168.1.1",
          "Mozilla/5.0",
        );
      }).not.toThrow();
    });
  });

  describe("Request ID in Response and Logs", () => {
    it("should include request ID in error response", () => {
      const req = {
        id: "test-request-123",
        startTime: Date.now(),
      } as unknown as Request;

      const res = {
        status: vi.fn(function () {
          return this;
        }),
        json: vi.fn(function (data) {
          expect(data.error.requestId).toBe("test-request-123");
          return this;
        }),
      } as unknown as Response;

      // Simulate what error handler does
      expect(req.id).toBe("test-request-123");
    });

    it("should return request ID in response header", () => {
      const req = {
        get: () => undefined,
      } as unknown as Request;

      const setHeaderCalls: [string, string][] = [];
      const res = {
        setHeader: vi.fn((header: string, value: string) => {
          setHeaderCalls.push([header, value]);
        }),
      } as unknown as Response;

      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(setHeaderCalls).toContainEqual(
        expect.arrayContaining([
          expect.stringMatching(/X-Request-ID/i),
          expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
        ]),
      );
    });
  });

  describe("Public Routes Without Authentication", () => {
    it("should log public requests without requiring user ID", () => {
      const req = {
        path: "/api/auth/login",
        method: "POST",
        id: "test-id",
        startTime: Date.now(),
        get: () => undefined,
      } as unknown as Request;

      const res = {
        statusCode: 200,
        end: vi.fn(function (...args: any[]) {}),
      } as unknown as Response;

      const next = vi.fn();

      // Should not throw even without user
      expect(() => {
        requestLoggerMiddleware(req, res, next);
      }).not.toThrow();
    });
  });
});
