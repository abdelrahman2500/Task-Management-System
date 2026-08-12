import { describe, it, expect, beforeAll, vi } from "vitest";
import { buildCompleteOpenAPISpec } from "./openapi";
import type { OpenAPIV3_1 } from "openapi-types";

describe("OpenAPI Specification", () => {
  let spec: OpenAPIV3_1.Document;

  beforeAll(() => {
    // Mock environment if needed for test
    process.env.DATABASE_URL =
      process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "test-secret-min-32-chars-long-1234567890";

    spec = buildCompleteOpenAPISpec();
  });

  it("should generate a valid OpenAPI 3.1 spec", () => {
    expect(spec.openapi).toBe("3.1.0");
  });

  it("should have correct API info", () => {
    expect(spec.info.title).toBe("Task Management API");
    expect(spec.info.version).toBe("1.0.0");
    expect(spec.info.description).toBeDefined();
    expect(spec.info.contact).toBeDefined();
    expect(spec.info.license).toBeDefined();
  });

  it("should have at least one server defined", () => {
    expect(Array.isArray(spec.servers)).toBe(true);
    expect(spec.servers!.length).toBeGreaterThan(0);
  });

  it("should define Bearer authentication", () => {
    expect(spec.components?.securitySchemes).toBeDefined();
    expect(spec.components?.securitySchemes!.BearerAuth).toBeDefined();
    const bearerAuth = spec.components!.securitySchemes!.BearerAuth as any;
    expect(bearerAuth.type).toBe("http");
    expect(bearerAuth.scheme).toBe("bearer");
    expect(bearerAuth.bearerFormat).toBe("JWT");
  });

  it("should define all required schemas", () => {
    const requiredSchemas = [
      "User",
      "AuthResponse",
      "Project",
      "ProjectMember",
      "Task",
      "Comment",
      "PaginationMetadata",
      "ErrorResponse",
    ];

    requiredSchemas.forEach((schemaName) => {
      expect(spec.components?.schemas).toBeDefined();
      expect(spec.components!.schemas![schemaName]).toBeDefined();
    });
  });

  it("should have all endpoint paths defined", () => {
    const expectedPaths = [
      "/auth/register",
      "/auth/login",
      "/auth/logout",
      "/auth/me",
      "/projects",
      "/projects/{projectId}",
      "/projects/{projectId}/members",
      "/projects/{projectId}/members/{memberId}",
      "/tasks/project/{projectId}",
      "/tasks/{taskId}",
      "/comments/task/{taskId}",
      "/comments/{commentId}",
    ];

    expectedPaths.forEach((path) => {
      expect(spec.paths).toBeDefined();
      expect(spec.paths![path]).toBeDefined();
    });
  });

  it("should document POST /auth/register endpoint", () => {
    const endpoint = spec.paths!["/auth/register"].post;
    expect(endpoint).toBeDefined();
    expect(endpoint!.summary).toBeDefined();
    expect(endpoint!.tags).toContain("Authentication");
    expect(endpoint!.requestBody).toBeDefined();
  });

  it("should document POST /auth/login endpoint", () => {
    const endpoint = spec.paths!["/auth/login"].post;
    expect(endpoint).toBeDefined();
    expect(endpoint!.tags).toContain("Authentication");
  });

  it("should document GET /auth/me endpoint", () => {
    const endpoint = spec.paths!["/auth/me"].get;
    expect(endpoint).toBeDefined();
    expect(endpoint!.security).toBeDefined();
    expect(endpoint!.security![0]).toHaveProperty("BearerAuth");
  });

  it("should document GET /projects endpoint with pagination", () => {
    const endpoint = spec.paths!["/projects"].get;
    expect(endpoint).toBeDefined();
    expect(endpoint!.parameters).toBeDefined();
    const paramNames = endpoint!.parameters!.map((p: any) => p.name);
    expect(paramNames).toContain("page");
    expect(paramNames).toContain("limit");
  });

  it("should document POST /projects endpoint", () => {
    const endpoint = spec.paths!["/projects"].post;
    expect(endpoint).toBeDefined();
    expect(endpoint!.security).toBeDefined();
  });

  it("should document GET /tasks/project/{projectId} with filters", () => {
    const endpoint = spec.paths!["/tasks/project/{projectId}"].get;
    expect(endpoint).toBeDefined();
    const paramNames = endpoint!.parameters!.map((p: any) => p.name);
    expect(paramNames).toContain("search");
    expect(paramNames).toContain("status");
    expect(paramNames).toContain("priority");
    expect(paramNames).toContain("assigneeId");
  });

  it("should mark protected endpoints with security requirements", () => {
    const protectedPaths = [
      "/auth/me",
      "/projects",
      "/tasks/project/{projectId}",
      "/comments/task/{taskId}",
    ];

    protectedPaths.forEach((path) => {
      const methods = spec.paths![path];
      Object.values(methods).forEach((operation: any) => {
        if (operation.security !== undefined) {
          expect(operation.security).toEqual([{ BearerAuth: [] }]);
        }
      });
    });
  });

  it("should document error responses with requestId", () => {
    const errorSchema = spec.components!.schemas!.ErrorResponse as any;
    expect(errorSchema.properties.error.properties.requestId).toBeDefined();
    expect(errorSchema.properties.error.required).toContain("requestId");
  });

  it("should not expose secrets in documentation", () => {
    const specString = JSON.stringify(spec);
    expect(specString).not.toContain("DATABASE_URL");
    expect(specString).not.toContain("JWT_SECRET");
    expect(specString).not.toContain("password_hash");
  });

  it("should document all HTTP status codes used", () => {
    const statusCodes = new Set<string>();

    Object.values(spec.paths!).forEach((pathItem: any) => {
      Object.values(pathItem).forEach((operation: any) => {
        if (operation.responses) {
          Object.keys(operation.responses).forEach((status) => {
            statusCodes.add(status);
          });
        }
      });
    });

    const allowedStatuses = [
      "200",
      "201",
      "400",
      "401",
      "403",
      "404",
      "409",
      "429",
      "500",
    ];
    statusCodes.forEach((status) => {
      expect(allowedStatuses).toContain(status);
    });
  });

  it("should have descriptions for all endpoints", () => {
    let endpointCount = 0;
    Object.values(spec.paths!).forEach((pathItem: any) => {
      ["get", "post", "put", "delete"].forEach((method) => {
        if (pathItem[method]) {
          endpointCount++;
          expect(
            pathItem[method].summary || pathItem[method].description,
          ).toBeDefined();
        }
      });
    });

    expect(endpointCount).toBeGreaterThan(15);
  });
});
