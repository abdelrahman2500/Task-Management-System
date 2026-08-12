import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZodError, z } from "zod";
import { errorHandler } from "./errorHandler";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../lib/errors";

// Mock the environment module
vi.mock("../config/environment", () => ({
  getEnvironment: vi.fn(() => ({
    database: { url: "postgresql://test" },
    jwt: { secret: "test-secret-is-long-enough-for-testing", expiresIn: "7d" },
    server: { port: 3000, nodeEnv: "development" },
    cors: { origin: "http://localhost:5173" },
  })),
}));

describe("Error Handler Middleware", () => {
  // Mock Express request/response/next
  const mockReq = {
    id: "test-request-id",
    startTime: Date.now(),
    method: "GET",
    path: "/api/test",
  } as any;
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HTTP Status Codes", () => {
    it("should return 400 for BadRequestError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new BadRequestError("Test message");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 for UnauthorizedError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new UnauthorizedError("Test message");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 403 for ForbiddenError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new ForbiddenError("Test message");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 for NotFoundError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new NotFoundError("Resource");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 409 for ConflictError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new ConflictError("Test message");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it("should return 422 for ValidationError", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new ValidationError({ field: "error" });

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
    });

    it("should return 500 for unknown errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new Error("Unknown error");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Error Response Format", () => {
    it("should return standardized error format", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new NotFoundError("Project");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toEqual({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
          requestId: "test-request-id",
        },
      });
    });

    it("should include error code", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new UnauthorizedError("Auth required");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).toHaveProperty("code");
      expect(response.error.code).toBe("UNAUTHORIZED");
    });

    it("should include error message", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new ForbiddenError("No access");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).toHaveProperty("message");
      expect(response.error.message).toBe("No access");
    });

    it("should include details for validation errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const details = [{ field: "email", message: "Invalid email" }];
      const error = new ValidationError(details);

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).toHaveProperty("details");
    });
  });

  describe("Zod Validation Errors", () => {
    it("should handle Zod validation errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      let zodError: ZodError | null = null;
      try {
        schema.parse({ email: "invalid", password: "short" });
      } catch (e) {
        zodError = e as ZodError;
      }

      if (zodError) {
        errorHandler(zodError, mockReq, mockRes as any, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        const response = mockRes.json.mock.calls[0][0];
        expect(response.error.code).toBe("VALIDATION_FAILED");
        expect(response.error.details).toBeDefined();
        expect(typeof response.error.details).toBe("object");
      }
    });

    it("should extract field names from Zod errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      const schema = z.object({
        email: z.string().email("Invalid email"),
      });

      let zodError: ZodError | null = null;
      try {
        schema.parse({ email: "not-an-email" });
      } catch (e) {
        zodError = e as ZodError;
      }

      if (zodError) {
        errorHandler(zodError, mockReq, mockRes as any, mockNext);

        const response = mockRes.json.mock.calls[0][0];
        expect(response.error.details.email).toBeDefined();
      }
    });
  });

  describe("Security - No Sensitive Data Exposure", () => {
    it("should not expose stack traces", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new Error("Database connection failed");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(JSON.stringify(response)).not.toContain("Error:");
    });

    it("should not expose database details", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const prismaError = new Error(
        "PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)",
      );
      prismaError.name = "PrismaClientKnownRequestError";

      errorHandler(prismaError, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error.message).not.toContain("PrismaClient");
      expect(response.error.message).not.toContain("constraint");
    });

    it("should sanitize error messages", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new NotFoundError("User");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      // Verify message is user-friendly, not technical
      expect(response.error.message).toMatch(/not found/i);
    });
  });

  describe("Error Details", () => {
    it("should include error details when available", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const customDetails = { userId: 123, reason: "Insufficient permissions" };
      const error = new AppError(403, "FORBIDDEN", "No access", customDetails);

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error.details).toEqual(customDetails);
    });

    it("should omit details if undefined", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new BadRequestError("Invalid input");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error).not.toHaveProperty("details");
    });
  });

  describe("Generic Error Handling", () => {
    it("should return generic message for unknown errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const error = new Error("Some random error");

      errorHandler(error, mockReq, mockRes as any, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(response.error.message).not.toBe("Some random error");
    });

    it("should have consistent error format for all errors", () => {
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const errors = [
        new BadRequestError(),
        new UnauthorizedError(),
        new ForbiddenError(),
        new NotFoundError(),
        new ConflictError("Test"),
      ];

      errors.forEach((error) => {
        mockRes.json.mockClear();
        errorHandler(error, mockReq, mockRes as any, mockNext);

        const response = mockRes.json.mock.calls[0][0];
        expect(response).toHaveProperty("success", false);
        expect(response.error).toHaveProperty("code");
        expect(response.error).toHaveProperty("message");
      });
    });
  });
});
