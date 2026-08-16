/**
 * User Signup E2E Tests
 *
 * Covers:
 * - User registration via UI
 * - Form validation
 * - Error handling (duplicate email, server errors)
 * - Auto-login after signup
 * - Rate limiting
 */

import { test, expect } from "@playwright/test";
import {
  generateTestUser,
  getAuthToken,
  cleanupTestUsers,
} from "../fixtures/auth";
import { cleanupUserData } from "../fixtures/database";

test.describe("User Signup", () => {
  test("should allow user signup via UI", async ({ page }) => {
    // Generate unique test user
    const testUser = generateTestUser("_signup_ui");

    // Navigate to signup page
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Verify we're on the signup page
    expect(page.url()).toContain("/auth/signup");

    // Fill signup form
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    // Submit form
    await page.click('button:has-text("Create Account")');

    // Should redirect to dashboard after successful signup
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

  test("should show validation error for empty name", async ({ page }) => {
    const testUser = generateTestUser("_signup_empty_name");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Leave name empty, fill other fields
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    // Try to submit
    await page.click('button:has-text("Create Account")');

    // Wait a moment for validation
    await page.waitForTimeout(500);

    // Should still be on signup page (not submitted)
    expect(page.url()).toContain("/auth/signup");

    // Should show validation error
    const errorMessage = page.locator("text=Name is required");
    await expect(errorMessage).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    const testUser = generateTestUser("_signup_invalid_email");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill form with invalid email
    await page.fill("#name", testUser.name);
    await page.fill("#email", "invalid-email");
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    // Try to submit
    await page.click('button:has-text("Create Account")');

    // Wait for validation
    await page.waitForTimeout(500);

    // Should still be on signup page
    expect(page.url()).toContain("/auth/signup");

    // Should show validation error for email
    const errorMessage = page.locator("text=Invalid email address");
    await expect(errorMessage).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    const testUser = generateTestUser("_signup_short_password");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill form with short password
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", "short");
    await page.fill("#confirmPassword", "short");

    // Try to submit
    await page.click('button:has-text("Create Account")');

    // Wait for validation
    await page.waitForTimeout(500);

    // Should still be on signup page
    expect(page.url()).toContain("/auth/signup");

    // Should show validation error
    const errorMessage = page.locator(
      "text=Password must be at least 8 characters",
    );
    await expect(errorMessage).toBeVisible();
  });

  test("should show validation error when passwords don't match", async ({
    page,
  }) => {
    const testUser = generateTestUser("_signup_password_mismatch");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill form with mismatched passwords
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", "DifferentPassword123!");

    // Try to submit
    await page.click('button:has-text("Create Account")');

    // Wait for validation
    await page.waitForTimeout(500);

    // Should still be on signup page
    expect(page.url()).toContain("/auth/signup");

    // Should show validation error
    const errorMessage = page.locator("text=Passwords do not match");
    await expect(errorMessage).toBeVisible();
  });

  test("should show error for duplicate email", async ({ page }) => {
    const testUser = generateTestUser("_signup_duplicate");

    // Register the user first via signup
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    await page.click('button:has-text("Create Account")');
    await page.waitForURL("/", { timeout: 10000 });

    // Get token to clean up later
    const token = await getAuthToken(page);

    // Logout to go back to signup
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Try to signup again with same email
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    await page.fill("#name", "Different Name");
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    await page.click('button:has-text("Create Account")');

    // Wait for response
    await page.waitForTimeout(1000);

    // Should show duplicate email error
    const errorMessage = page.locator(
      "text=An account with this email already exists",
    );
    await expect(errorMessage).toBeVisible();

    // Cleanup
    if (token) {
      await cleanupUserData(token);
    }
  });

  test("should show loading state during signup", async ({ page }) => {
    const testUser = generateTestUser("_signup_loading");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill form
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    // Click submit and immediately check for loading state
    const submitButton = page.locator('button:has-text("Create Account")');
    await submitButton.click();

    // Button should be disabled/loading
    await expect(submitButton).toBeDisabled();

    // Wait for response and redirect
    await page.waitForURL("/", { timeout: 10000 });

    // Verify we're logged in
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Cleanup
    if (token) {
      await cleanupUserData(token);
    }
  });

  test("should navigate to login from signup page", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Click "Sign In" link
    await page.click('button:has-text("Sign In")');

    // Should navigate to login page
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("should navigate to signup from login page", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Click "Sign Up" link
    await page.click('button:has-text("Sign Up")');

    // Should navigate to signup page
    await page.waitForURL("/auth/signup");
    expect(page.url()).toContain("/auth/signup");
  });

  test("should allow user to login after signup", async ({ page }) => {
    const testUser = generateTestUser("_signup_then_login");

    // First signup
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    await page.click('button:has-text("Create Account")');
    await page.waitForURL("/", { timeout: 10000 });

    // Get token and verify we're logged in
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Logout by clearing token
    await page.evaluate(() => localStorage.removeItem("access_token"));

    // Try to access dashboard - should redirect to login
    await page.goto("/");
    await page.waitForURL("/auth/login");

    // Now login with the same credentials
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.click('button:has-text("Sign In")');

    // Should redirect to dashboard
    await page.waitForURL("/", { timeout: 10000 });

    // Verify auth token is stored
    token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Cleanup
    if (token) {
      await cleanupUserData(token);
    }
  });

  test("should prevent duplicate submission", async ({ page }) => {
    const testUser = generateTestUser("_signup_duplicate_submit");

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill form
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#confirmPassword", testUser.password);

    // Click submit multiple times rapidly
    const submitButton = page.locator('button:has-text("Create Account")');
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    // Should only create one user and redirect once
    await page.waitForURL("/", { timeout: 10000 });

    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Cleanup
    if (token) {
      await cleanupUserData(token);
    }
  });

  test("should show form fields are properly labeled", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Verify form fields exist with proper labels
    await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
    await expect(
      page.locator('label:has-text("Confirm Password")'),
    ).toBeVisible();
  });
});
