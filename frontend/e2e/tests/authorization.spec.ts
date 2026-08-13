/**
 * Authorization E2E Tests
 *
 * Covers:
 * - Authentication required for protected endpoints
 * - Authorization checks for cross-user operations
 * - Permission validation for project operations
 * - Error handling for unauthorized access
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "../fixtures/auth";
import {
  cleanupUserData,
  createProject,
  createTask,
} from "../fixtures/database";

test.describe("Authorization", () => {
  test("should require authentication for protected endpoints", async () => {
    // Try to access protected endpoint without token
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // No authorization header
    });

    // Should return 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  test("should reject requests with invalid token", async () => {
    // Try to access with invalid token
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid_token_123",
      },
    });

    // Should return 401 (Unauthorized)
    expect(response.status).toBe(401);
  });

  test("should allow users to access their own projects", async () => {
    // Register a user
    const testUser = generateTestUser("_auth_own");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "My Project",
      description: "User's own project",
      status: "active",
    });

    // Access the project with token
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
      },
    );

    // Should succeed
    expect(response.status).toBe(200);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should prevent users from deleting other users' projects", async () => {
    // Register two users
    const owner = generateTestUser("_owner");
    const ownerReg = await registerUser(owner);

    const other = generateTestUser("_other");
    const otherReg = await registerUser(other);

    // Owner creates a project
    const project = await createProject(ownerReg.token, {
      name: "Owner's Project",
      description: "Only owner should delete",
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

    // Should fail (403 Forbidden or 401)
    expect([401, 403]).toContain(response.status);

    // Cleanup
    await cleanupUserData(ownerReg.token);
    await cleanupUserData(otherReg.token);
  });

  test("should handle 404 for non-existent resources", async () => {
    // Register a user
    const testUser = generateTestUser("_auth_404");
    const registered = await registerUser(testUser);

    // Try to access non-existent project
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

  test("should handle validation errors gracefully", async () => {
    // Register a user
    const testUser = generateTestUser("_auth_validation");
    const registered = await registerUser(testUser);

    // Try to create project with invalid data
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registered.token}`,
      },
      body: JSON.stringify({
        name: "", // Invalid: empty name
        description: "Missing name",
      }),
    });

    // Should return 422 (Unprocessable Entity)
    expect(response.status).toBe(422);

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
