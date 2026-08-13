/**
 * Authentication Edge Cases E2E Tests
 *
 * Covers edge cases and error scenarios:
 * - Empty field validation
 * - Invalid email formats
 * - Session management
 * - Token expiration behavior
 *
 * Uses shared fixture to reduce rate limiting impact
 */

import { test, expect } from "@playwright/test";
import {
  generateTestUser,
  getAuthToken,
  setAuthToken,
  registerUser,
} from "../fixtures/auth";
import { cleanupUserData } from "../fixtures/database";

let registered: any;

test.beforeAll(async () => {
  const testUser = generateTestUser("_auth_edge");
  registered = await registerUser(testUser);
});

test.afterAll(async () => {
  if (registered) {
    await cleanupUserData(registered.token);
  }
});

test.describe("Authentication Edge Cases", () => {
  test("should reject login with empty email field", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Leave email empty, fill password
    await page.fill("#password", "SomePassword123!@#");

    // Try to submit
    await page.click('button[type="submit"]');

    // Wait for validation or error
    await page.waitForTimeout(1000);

    // Should still be on login page (not authenticated)
    expect(page.url()).toContain("/auth/login");
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test("should reject login with empty password field", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Fill email but leave password empty
    await page.fill("#email", registered.email);

    // Try to submit
    await page.click('button[type="submit"]');

    // Wait for validation or error
    await page.waitForTimeout(1000);

    // Should still be on login page
    expect(page.url()).toContain("/auth/login");
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test("should reject login with both fields empty", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Don't fill any fields, just try to submit
    await page.click('button[type="submit"]');

    // Wait for validation or error
    await page.waitForTimeout(1000);

    // Should still be on login page
    expect(page.url()).toContain("/auth/login");
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test("should handle rapid consecutive login attempts gracefully", async ({
    page,
  }) => {
    // Use shared user
    await setAuthToken(page, registered.token);
    // Clear token for this test
    await page.evaluate(() => localStorage.removeItem("token"));

    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Attempt login with wrong password
    await page.fill("#email", registered.email);
    await page.fill("#password", "WrongPassword1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Attempt again immediately
    await page.fill("#email", registered.email);
    await page.fill("#password", "WrongPassword2");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Attempt with correct password
    await page.fill("#email", registered.email);
    await page.fill("#password", registered.password);
    await page.click('button[type="submit"]');

    // Should eventually succeed or show rate limit
    await page.waitForTimeout(2000);

    // Either authenticated or on login page (rate limited)
    const token = await getAuthToken(page);
    const isOnLoginPage = page.url().includes("/auth/login");
    expect(token || isOnLoginPage).toBeTruthy();
  });

  test("should clear auth token on explicit logout", async ({ page }) => {
    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify token exists
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Find and click logout
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("logout"), [data-test="logout-button"]',
    );
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    }

    // Token should be cleared
    token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test("should preserve auth state through navigation", async ({ page }) => {
    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to projects
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Verify still authenticated
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Navigate to tasks
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Verify still authenticated
    token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Navigate back to dashboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify still authenticated
    token = await getAuthToken(page);
    expect(token).toBeTruthy();
  });

  test("should handle protected route access without token", async ({
    page,
  }) => {
    // Try to navigate directly to protected route without token
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Should redirect to login
    expect(page.url()).toContain("/auth/login");

    // Try to navigate to tasks
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Should redirect to login
    expect(page.url()).toContain("/auth/login");
  });

  test("should prevent re-registration with same email", async () => {
    // Try to register again with same email
    const duplicate = { ...registered };
    duplicate.password = "DifferentPassword123!@#";

    // Try via API
    const response = await fetch("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: duplicate.name,
        email: duplicate.email,
        password: duplicate.password,
      }),
    });

    // Should get a conflict error (409 or 422)
    expect([409, 422]).toContain(response.status);
  });
});
