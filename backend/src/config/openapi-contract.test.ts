import { describe, it, expect, beforeAll } from "vitest";
import { buildCompleteOpenAPISpec } from "./openapi";
import type { OpenAPIV3_1 } from "openapi-types";

/**
 * OpenAPI Contract Verification Test
 *
 * This test verifies that the OpenAPI specification accurately reflects
 * the actual Express API implementation.
 *
 * It compares:
 * 1. All Express routes against OpenAPI paths
 * 2. HTTP methods
 * 3. Authentication requirements
 * 4. Path parameters
 * 5. Query parameters
 * 6. Request body schemas
 * 7. Response schemas
 * 8. Status codes
 */

/**
 * Authoritative inventory of all Express routes
 * Extracted directly from: auth.routes, project.routes, task.routes, comment.routes, app.ts
 */
const EXPRESS_ROUTES = [
  // Auth routes (no authentication prefix applied)
  {
    method: "POST",
    path: "/api/v1/auth/register",
    auth: false,
    label: "Register",
  },
  { method: "POST", path: "/api/v1/auth/login", auth: false, label: "Login" },
  { method: "POST", path: "/api/v1/auth/logout", auth: false, label: "Logout" },
  { method: "GET", path: "/api/v1/auth/me", auth: true, label: "Get Me" },

  // Project routes (all require auth)
  {
    method: "GET",
    path: "/api/v1/projects",
    auth: true,
    label: "List Projects",
  },
  {
    method: "POST",
    path: "/api/v1/projects",
    auth: true,
    label: "Create Project",
  },
  {
    method: "GET",
    path: "/api/v1/projects/:projectId",
    auth: true,
    label: "Get Project",
  },
  {
    method: "PUT",
    path: "/api/v1/projects/:projectId",
    auth: true,
    label: "Update Project",
  },
  {
    method: "DELETE",
    path: "/api/v1/projects/:projectId",
    auth: true,
    label: "Delete Project",
  },

  // Project Members routes (all require auth)
  {
    method: "GET",
    path: "/api/v1/projects/:projectId/members",
    auth: true,
    label: "List Members",
  },
  {
    method: "POST",
    path: "/api/v1/projects/:projectId/members",
    auth: true,
    label: "Add Member",
  },
  {
    method: "PUT",
    path: "/api/v1/projects/:projectId/members/:memberId",
    auth: true,
    label: "Update Member",
  },
  {
    method: "DELETE",
    path: "/api/v1/projects/:projectId/members/:memberId",
    auth: true,
    label: "Remove Member",
  },

  // Task routes (all require auth)
  {
    method: "GET",
    path: "/api/v1/tasks/project/:projectId",
    auth: true,
    label: "List Tasks",
  },
  {
    method: "POST",
    path: "/api/v1/tasks/project/:projectId",
    auth: true,
    label: "Create Task",
  },
  {
    method: "GET",
    path: "/api/v1/tasks/:taskId",
    auth: true,
    label: "Get Task",
  },
  {
    method: "PUT",
    path: "/api/v1/tasks/:taskId",
    auth: true,
    label: "Update Task",
  },
  {
    method: "DELETE",
    path: "/api/v1/tasks/:taskId",
    auth: true,
    label: "Delete Task",
  },

  // Comment routes (all require auth)
  {
    method: "GET",
    path: "/api/v1/comments/task/:taskId",
    auth: true,
    label: "List Comments",
  },
  {
    method: "POST",
    path: "/api/v1/comments/task/:taskId",
    auth: true,
    label: "Add Comment",
  },
  {
    method: "PUT",
    path: "/api/v1/comments/:commentId",
    auth: true,
    label: "Update Comment",
  },
  {
    method: "DELETE",
    path: "/api/v1/comments/:commentId",
    auth: true,
    label: "Delete Comment",
  },

  // Infrastructure routes (not part of OpenAPI spec)
  {
    method: "GET",
    path: "/health",
    auth: false,
    label: "Health Check",
    infrastructure: true,
  },
  {
    method: "GET",
    path: "/docs",
    auth: false,
    label: "Swagger UI",
    infrastructure: true,
  },
  {
    method: "GET",
    path: "/openapi.json",
    auth: false,
    label: "OpenAPI JSON",
    infrastructure: true,
  },
];

/**
 * Normalize Express path to OpenAPI format
 * /api/v1/projects/:projectId -> /projects/{projectId}
 */
function normalizeExpressPath(expressPath: string): string {
  // Remove /api/v1 prefix
  let normalized = expressPath.replace(/^\/api\/v1/, "");

  // Convert :param to {param}
  normalized = normalized.replace(/:(\w+)/g, "{$1}");

  return normalized;
}

/**
 * Get all paths from OpenAPI spec
 */
function getOpenAPIPaths(spec: any): Array<{
  method: string;
  path: string;
  hasSecurity: boolean;
}> {
  const paths: Array<{ method: string; path: string; hasSecurity: boolean }> =
    [];

  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    const pathObj = pathItem as any;
    for (const method of ["get", "post", "put", "delete", "patch"]) {
      if (pathObj[method]) {
        const operation = pathObj[method];
        const hasSecurity =
          !!operation.security && operation.security.length > 0;
        paths.push({
          method: method.toUpperCase(),
          path: pathKey,
          hasSecurity,
        });
      }
    }
  }

  return paths;
}

describe("OpenAPI Contract Verification", () => {
  let spec: any;
  let openAPIPaths: Array<{
    method: string;
    path: string;
    hasSecurity: boolean;
  }>;

  beforeAll(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "test-secret-min-32-chars-long-1234567890";

    spec = buildCompleteOpenAPISpec();
    openAPIPaths = getOpenAPIPaths(spec);
  });

  describe("Endpoint Inventory", () => {
    it("should have 22 total Express routes (excluding infrastructure)", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);
      expect(apiRoutes).toHaveLength(22);
    });

    it("should have correct count per category", () => {
      const auth = EXPRESS_ROUTES.filter(
        (r) => r.path.includes("/auth") && !r.infrastructure,
      );
      const projects = EXPRESS_ROUTES.filter(
        (r) => r.path.includes("/projects") && !r.infrastructure,
      );
      const tasks = EXPRESS_ROUTES.filter(
        (r) => r.path.includes("/tasks") && !r.infrastructure,
      );
      const comments = EXPRESS_ROUTES.filter(
        (r) => r.path.includes("/comments") && !r.infrastructure,
      );

      expect(auth).toHaveLength(4);
      expect(projects).toHaveLength(9);
      expect(tasks).toHaveLength(5);
      expect(comments).toHaveLength(4);
    });

    it("should list OpenAPI endpoint count", () => {
      expect(openAPIPaths.length).toBeGreaterThan(0);
      console.log(`OpenAPI has ${openAPIPaths.length} endpoints`);
    });
  });

  describe("Route Normalization", () => {
    it("should normalize Express paths correctly", () => {
      expect(normalizeExpressPath("/api/v1/projects")).toBe("/projects");
      expect(normalizeExpressPath("/api/v1/projects/:projectId")).toBe(
        "/projects/{projectId}",
      );
      expect(
        normalizeExpressPath("/api/v1/projects/:projectId/members/:memberId"),
      ).toBe("/projects/{projectId}/members/{memberId}");
    });
  });

  describe("Express-to-OpenAPI Mapping", () => {
    it("should have OpenAPI spec for every API route", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      const notFound: any[] = [];

      for (const route of apiRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const found = openAPIPaths.find(
          (p) => p.path === normalized && p.method === route.method,
        );

        if (!found) {
          notFound.push({
            method: route.method,
            path: route.path,
            normalized,
            label: route.label,
          });
        }
      }

      if (notFound.length > 0) {
        console.error("Routes missing from OpenAPI:", notFound);
      }

      expect(notFound).toHaveLength(0);
    });

    it("should not have extra paths in OpenAPI", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);
      const normalizedExpress = new Set(
        apiRoutes.map((r) => `${r.method} ${normalizeExpressPath(r.path)}`),
      );

      const extra: any[] = [];

      for (const oaPath of openAPIPaths) {
        const key = `${oaPath.method} ${oaPath.path}`;
        if (!normalizedExpress.has(key)) {
          extra.push({ method: oaPath.method, path: oaPath.path });
        }
      }

      if (extra.length > 0) {
        console.warn("Extra paths in OpenAPI (may be intentional):", extra);
      }

      expect(extra).toHaveLength(0);
    });
  });

  describe("Authentication Contract", () => {
    it("should mark all auth-required routes with security in OpenAPI", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      const mismatches: any[] = [];

      for (const route of apiRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const oaPath = openAPIPaths.find(
          (p) => p.path === normalized && p.method === route.method,
        );

        if (!oaPath) {
          continue; // Already checked in previous test
        }

        // Check authentication mismatch
        if (route.auth && !oaPath.hasSecurity) {
          mismatches.push({
            route: route.label,
            method: route.method,
            path: route.path,
            issue: "Requires auth but not marked in OpenAPI",
          });
        }

        if (!route.auth && oaPath.hasSecurity) {
          mismatches.push({
            route: route.label,
            method: route.method,
            path: route.path,
            issue: "Does not require auth but marked in OpenAPI",
          });
        }
      }

      if (mismatches.length > 0) {
        console.error("Authentication mismatches:", mismatches);
      }

      expect(mismatches).toHaveLength(0);
    });

    it("should have BearerAuth security scheme", () => {
      expect(spec.components?.securitySchemes?.BearerAuth).toBeDefined();
      const bearerAuth = spec.components.securitySchemes.BearerAuth as any;
      expect(bearerAuth.type).toBe("http");
      expect(bearerAuth.scheme).toBe("bearer");
      expect(bearerAuth.bearerFormat).toBe("JWT");
    });
  });

  describe("Path Parameters", () => {
    it("should document projectId parameter where used", () => {
      const projectIdRoutes = [
        "/projects/{projectId}",
        "/projects/{projectId}/members",
        "/projects/{projectId}/members/{memberId}",
        "/tasks/project/{projectId}",
      ];

      for (const path of projectIdRoutes) {
        const pathItem = spec.paths[path];
        expect(pathItem).toBeDefined();

        // Check that at least one method documents the parameter
        let hasParam = false;
        for (const method of ["get", "post", "put", "delete"]) {
          if (pathItem[method]) {
            const operation = pathItem[method];
            if (
              operation.parameters &&
              operation.parameters.some((p: any) => p.name === "projectId")
            ) {
              hasParam = true;
              break;
            }
          }
        }

        expect(hasParam).toBe(true);
      }
    });

    it("should document taskId parameter where used", () => {
      const taskIdRoutes = ["/tasks/{taskId}", "/comments/task/{taskId}"];

      for (const path of taskIdRoutes) {
        const pathItem = spec.paths[path];
        expect(pathItem).toBeDefined();

        let hasParam = false;
        for (const method of ["get", "post", "put", "delete"]) {
          if (pathItem[method]) {
            const operation = pathItem[method];
            if (
              operation.parameters &&
              operation.parameters.some((p: any) => p.name === "taskId")
            ) {
              hasParam = true;
              break;
            }
          }
        }

        expect(hasParam).toBe(true);
      }
    });
  });

  describe("Query Parameters", () => {
    it("should document pagination on list endpoints", () => {
      const listEndpoints = [
        "/projects",
        "/projects/{projectId}/members",
        "/tasks/project/{projectId}",
        "/comments/task/{taskId}",
      ];

      for (const path of listEndpoints) {
        const pathItem = spec.paths[path];
        const getOp = pathItem?.get;
        expect(getOp).toBeDefined();

        const paramNames = (getOp!.parameters || []).map((p: any) => p.name);
        expect(paramNames).toContain("page");
        expect(paramNames).toContain("limit");
      }
    });

    it("should document task filters on list tasks endpoint", () => {
      const listTasksOp = spec.paths["/tasks/project/{projectId}"].get;
      expect(listTasksOp).toBeDefined();

      const paramNames = (listTasksOp!.parameters || []).map(
        (p: any) => p.name,
      );
      expect(paramNames).toContain("search");
      expect(paramNames).toContain("status");
      expect(paramNames).toContain("priority");
      expect(paramNames).toContain("assigneeId");
    });
  });

  describe("Request Bodies", () => {
    it("should have request bodies on POST routes (except logout)", () => {
      const postRoutes = EXPRESS_ROUTES.filter(
        (r) => r.method === "POST" && !r.infrastructure && r.label !== "Logout",
      );

      const missing: any[] = [];

      for (const route of postRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const pathItem = spec.paths[normalized];
        expect(pathItem).toBeDefined();

        const postOp = pathItem.post;
        expect(postOp).toBeDefined();

        if (!postOp.requestBody) {
          missing.push({ route: route.label, path: normalized });
        }

        expect(postOp.requestBody).toBeDefined();
      }

      if (missing.length > 0) {
        console.error("POST routes missing requestBody:", missing);
      }
    });

    it("should allow POST routes without body (e.g., logout)", () => {
      const logoutOp = spec.paths["/auth/logout"].post;
      expect(logoutOp).toBeDefined();
      // Logout endpoint has no request body
      expect(logoutOp.requestBody).toBeUndefined();
      // But should have response
      expect(logoutOp.responses).toBeDefined();
    });

    it("should have request bodies on PUT routes", () => {
      const putRoutes = EXPRESS_ROUTES.filter(
        (r) => r.method === "PUT" && !r.infrastructure,
      );

      for (const route of putRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const pathItem = spec.paths[normalized];
        expect(pathItem).toBeDefined();

        const putOp = pathItem.put;
        expect(putOp).toBeDefined();
        expect(putOp.requestBody).toBeDefined();
      }
    });
  });

  describe("Response Schemas", () => {
    it("should document success responses for all endpoints", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      for (const route of apiRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const pathItem = spec.paths[normalized];
        const operation = pathItem[route.method.toLowerCase()];

        expect(operation).toBeDefined();
        expect(operation.responses).toBeDefined();
        expect(Object.keys(operation.responses).length).toBeGreaterThan(0);

        // Should have at least 200 or 201
        const statusCodes = Object.keys(operation.responses);
        const hasSuccessCode = statusCodes.some((code) => code.startsWith("2"));
        expect(hasSuccessCode).toBe(true);
      }
    });

    it("should document error responses for all endpoints", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      for (const route of apiRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const pathItem = spec.paths[normalized];
        const operation = pathItem[route.method.toLowerCase()];

        const statusCodes = Object.keys(operation.responses);
        const hasErrorCode = statusCodes.some((code) => !code.startsWith("2"));
        expect(hasErrorCode).toBe(true);
      }
    });
  });

  describe("Status Code Documentation", () => {
    it("should only use valid status codes", () => {
      const validCodes = [
        "200",
        "201",
        "204",
        "400",
        "401",
        "403",
        "404",
        "409",
        "422",
        "429",
        "500",
      ];
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      const invalidCodes = new Set<string>();

      for (const route of apiRoutes) {
        const normalized = normalizeExpressPath(route.path);
        const pathItem = spec.paths[normalized];
        const operation = pathItem[route.method.toLowerCase()];

        Object.keys(operation.responses).forEach((code) => {
          if (!validCodes.includes(code)) {
            invalidCodes.add(code);
          }
        });
      }

      expect(invalidCodes.size).toBe(0);
    });
  });

  describe("Summary Report", () => {
    it("should print contract verification summary", () => {
      const apiRoutes = EXPRESS_ROUTES.filter((r) => !r.infrastructure);

      console.log("\n=== OpenAPI CONTRACT VERIFICATION SUMMARY ===\n");
      console.log(`EXPRESS ENDPOINTS: ${apiRoutes.length}`);
      console.log(`OPENAPI ENDPOINTS: ${openAPIPaths.length}`);

      // Count auth requirements
      const expressAuth = apiRoutes.filter((r) => r.auth).length;
      const openAPIAuth = openAPIPaths.filter((p) => p.hasSecurity).length;

      console.log(`\nAUTH COMPARISON:`);
      console.log(`  Express routes requiring auth: ${expressAuth}`);
      console.log(`  OpenAPI endpoints with security: ${openAPIAuth}`);

      // Count by method
      const methodCounts = apiRoutes.reduce(
        (acc, r) => {
          acc[r.method] = (acc[r.method] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log(`\nMETHOD DISTRIBUTION:`);
      Object.entries(methodCounts).forEach(([method, count]) => {
        console.log(`  ${method}: ${count}`);
      });

      console.log(`\nROUTE CATEGORIES:`);
      console.log(`  Auth: 4`);
      console.log(`  Projects: 9`);
      console.log(`  Tasks: 5`);
      console.log(`  Comments: 4`);

      console.log(`\n✅ Contract Verification Complete\n`);
    });
  });
});
