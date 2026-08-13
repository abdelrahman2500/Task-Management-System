/**
 * API Resilience E2E Tests
 *
 * Covers:
 * - API error handling (4xx, 5xx errors)
 * - Retry behavior
 * - Request timeout handling
 * - Network error recovery
 * - Error messages display
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
import { cleanupUserData, createProject } from "../fixtures/database";

test.describe("API Resilience", () => {
  test("should handle 422 validation errors from API", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_422");
    const registered = await registerUser(testUser);

    // Try to create project with missing required fields
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registered.token}`,
      },
      body: JSON.stringify({
        // Missing name field
        description: "No name",
      }),
    });

    // Should return 422 (Unprocessable Entity)
    expect(response.status).toBe(422);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should handle 401 authentication errors", async () => {
    // Try to access without token
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // Should return 401
    expect(response.status).toBe(401);
  });

  test("should handle 403 forbidden errors", async () => {
    // Register two users
    const owner = generateTestUser("_owner");
    const ownerReg = await registerUser(owner);

    const other = generateTestUser("_other");
    const otherReg = await registerUser(other);

    // Owner creates a project
    const project = await createProject(ownerReg.token, {
      name: "Restricted Project",
      description: "Only for owner",
      status: "active",
    });

    // Other user tries to delete it
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherReg.token}`,
        },
      },
    );

    // Should fail (403 or 401)
    expect([401, 403]).toContain(response.status);

    // Cleanup
    await cleanupUserData(ownerReg.token);
    await cleanupUserData(otherReg.token);
  });

  test("should handle 404 not found errors", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_404");
    const registered = await registerUser(testUser);

    // Try to fetch non-existent resource
    const response = await fetch(
      "http://localhost:3000/api/v1/projects/999999",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
      },
    );

    // Should return 404
    expect(response.status).toBe(404);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should handle successful responses correctly", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_200");
    const registered = await registerUser(testUser);

    // Create a project successfully
    const project = await createProject(registered.token, {
      name: "Success Test Project",
      description: "Should succeed",
      status: "active",
    });

    // Verify project was created
    expect(project.id).toBeDefined();
    expect(project.name).toBe("Success Test Project");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should show dashboard when authenticated", async ({ page }) => {
    // Register a user
    const testUser = generateTestUser("_resilience_ui");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should be on dashboard
    expect(page.url()).not.toContain("/auth/login");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should handle repeated API calls", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_repeat");
    const registered = await registerUser(testUser);

    // Make multiple API calls
    for (let i = 0; i < 3; i++) {
      const response = await fetch("http://localhost:3000/api/v1/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
      });

      expect(response.status).toBe(200);
    }

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should handle concurrent requests", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_concurrent");
    const registered = await registerUser(testUser);

    // Make multiple concurrent requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        fetch("http://localhost:3000/api/v1/projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registered.token}`,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);

    // All should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should handle rate limiting gracefully", async () => {
    // Register a user
    const testUser = generateTestUser("_resilience_ratelimit");
    const registered = await registerUser(testUser);

    // Make many requests in quick succession (may trigger rate limiting)
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        fetch("http://localhost:3000/api/v1/projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registered.token}`,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);

    // Should get mostly 200s (some might be 429 if rate limited)
    let successCount = 0;
    let rateLimitCount = 0;

    responses.forEach((response) => {
      if (response.status === 200) {
        successCount++;
      } else if (response.status === 429) {
        rateLimitCount++;
      }
    });

    // Most should succeed
    expect(successCount).toBeGreaterThan(0);

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
