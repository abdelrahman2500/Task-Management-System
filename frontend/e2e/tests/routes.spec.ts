/**
 * Route Protection E2E Tests
 *
 * Covers:
 * - Protected routes redirect to login when not authenticated
 * - Public routes are accessible without authentication
 * - Protected routes are accessible with valid token
 * - Route navigation works correctly
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
import { cleanupUserData } from "../fixtures/database";

test.describe("Route Protection", () => {
  test("should redirect unauthenticated users to login page", async ({
    page,
  }) => {
    // Clear any existing auth
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("accessToken"));

    // Reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should be redirected to login
    expect(page.url()).toContain("/auth/login");
  });

  test("should allow access to login page without token", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Should be able to access without redirecting
    expect(page.url()).toContain("/auth/login");

    // Should see login form
    const emailInput = page.locator("#email");
    expect(await emailInput.isVisible()).toBeTruthy();
  });

  test("should allow authenticated users to access protected dashboard", async ({
    page,
  }) => {
    // Register and get token
    const testUser = generateTestUser("_dashboard");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should stay on dashboard (not redirected to login)
    expect(page.url()).not.toContain("/auth/login");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should redirect to login when accessing protected route without token", async ({
    page,
  }) => {
    // Establish a document origin before accessing local storage.
    await page.goto("/auth/login");
    await page.evaluate(() => localStorage.removeItem("accessToken"));

    // Navigate to protected route
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Should be redirected to login
    expect(page.url()).toContain("/auth/login");
  });

  test("should maintain auth state during navigation", async ({ page }) => {
    // Register and get token
    const testUser = generateTestUser("_navigation");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should be on dashboard
    expect(page.url()).not.toContain("/auth/login");

    // Navigate to projects
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Should still be authenticated (not on login page)
    expect(page.url()).not.toContain("/auth/login");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should allow navigation to tasks page when authenticated", async ({
    page,
  }) => {
    // Register and get token
    const testUser = generateTestUser("_tasks");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to tasks
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Should be on tasks page
    expect(page.url()).toContain("/tasks");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should allow navigation to settings page when authenticated", async ({
    page,
  }) => {
    // Register and get token
    const testUser = generateTestUser("_settings");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to settings
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Should be on settings page
    expect(page.url()).toContain("/settings");

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
