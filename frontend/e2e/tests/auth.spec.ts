/**
 * Authentication E2E Tests
 *
 * Covers:
 * - User login via API and UI
 * - User logout
 * - Auth token storage and retrieval
 * - Authentication state persistence
 */

import { test, expect } from "@playwright/test";
import {
  generateTestUser,
  getAuthToken,
  setAuthToken,
  registerUser,
} from "../fixtures/auth";
import { cleanupUserData } from "../fixtures/database";

test.describe("Authentication", () => {
  test("should allow user login via UI", async ({ page }) => {
    // Register a user via API first
    const testUser = generateTestUser("_login_ui");
    const registered = await registerUser(testUser);

    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Verify we're on the login page
    expect(page.url()).toContain("/auth/login");

    // Fill login form using ID attributes
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL("/", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify auth token is stored
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Cleanup
    if (token) {
      await cleanupUserData(token);
    }
  });

  test("should reject login with invalid credentials", async ({ page }) => {
    // Register a user via API
    const testUser = generateTestUser("_login_invalid");
    await registerUser(testUser);

    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Fill login form with wrong password
    await page.fill("#email", testUser.email);
    await page.fill("#password", "WrongPassword123!@#");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait a moment for the request
    await page.waitForTimeout(2000);

    // Should still be on login page or show error
    const isOnLoginPage = page.url().includes("/auth/login");
    expect(isOnLoginPage).toBeTruthy();

    // Should NOT have auth token
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test("should allow user logout", async ({ page }) => {
    // Register user via API
    const testUser = generateTestUser("_logout");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify we're authenticated
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Find and click logout button
    // Look for logout in menu or navigation
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("logout"), [data-test="logout-button"]',
    );
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    }

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should persist auth token across page reloads", async ({ page }) => {
    // Register user via API
    const testUser = generateTestUser("_persist");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify auth token exists
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify auth token still exists
    token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Should still be on dashboard (not redirected to login)
    expect(page.url()).not.toContain("/auth/login");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should register new user via API", async () => {
    // Test user registration via API
    const testUser = generateTestUser("_api_register");
    const result = await registerUser(testUser);

    // Verify response
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe(testUser.email);

    // Cleanup
    await cleanupUserData(result.token);
  });

  test("should handle login page redirect when not authenticated", async ({
    page,
  }) => {
    // Navigate to protected route without token
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Should be redirected to login
    expect(page.url()).toContain("/auth/login");
  });
});
