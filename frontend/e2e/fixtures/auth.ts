/**
 * Authentication Fixtures
 *
 * Provides helpers for user registration, login, and logout in E2E tests.
 * Manages test user creation and token storage.
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const API_URL =
  process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";

export interface TestUser {
  id?: number;
  email: string;
  password: string;
  name: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AuthTokens {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Generate a unique test user for each test
 */
export function generateTestUser(suffix: string = ""): TestUser {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const uniqueId = `${timestamp}_${randomId}${suffix}`;

  return {
    email: `test-${uniqueId}@example.com`,
    password: "TestPassword123!@#",
    name: `Test User${suffix}`,
  };
}

/**
 * Register a new user via API
 */
export async function registerUser(user: TestUser): Promise<AuthTokens> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The application correctly limits auth attempts per client IP. Each
      // isolated E2E user represents an independent client.
      "X-Forwarded-For": testClientIp(user.email),
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Registration failed: ${JSON.stringify(error)}`);
  }

  const payload = (await response.json()) as ApiEnvelope<AuthTokens>;

  // Add delay after registration to avoid rate limiting
  // (significantly increased to ensure rate limiter doesn't block)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return payload.data;
}

function testClientIp(seed: string): string {
  let hash = 0;
  for (const character of seed)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return `10.${(hash >>> 16) & 255}.${(hash >>> 8) & 255}.${hash & 255}`;
}

/**
 * Login user via API
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }

  const payload = (await response.json()) as ApiEnvelope<AuthTokens>;
  return payload.data;
}

/**
 * Store auth token in localStorage via page context
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.addInitScript((tokenValue) => {
    localStorage.setItem("accessToken", tokenValue);
  }, token);
}

/**
 * Get current auth token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem("accessToken"));
}

/**
 * Clear auth token from localStorage
 */
export async function clearAuthToken(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem("accessToken"));
}

/**
 * Login a user in the UI (navigate to login page and submit form)
 */
export async function loginInUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  // Navigate to login page
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  // Fill email and password using type selectors (more reliable than name)
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Submit form
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for redirect to dashboard (successful login)
  await page.waitForURL("/", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

/**
 * Register a user in the UI (navigate to register page and submit form)
 */
export async function registerInUI(page: Page, user: TestUser): Promise<void> {
  // Navigate to register page
  await page.goto("/auth/register");
  await page.waitForLoadState("networkidle");

  // Fill form fields
  await page.fill('input[name="name"]', user.name);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (successful registration)
  await page.waitForURL("/", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

/**
 * Logout from the UI (click logout button)
 */
export async function logoutFromUI(page: Page): Promise<void> {
  // Navigate to dashboard first to ensure we're logged in
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Open user menu (usually in header/navbar)
  const userMenuButton = page.locator('[data-testid="user-menu-button"]');
  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
    await page.waitForLoadState("networkidle");
  }

  // Click logout
  const logoutButton = page.locator('[data-testid="logout-button"]');
  await logoutButton.click();

  // Wait for redirect to login page
  await page.waitForURL("/auth/login", { timeout: 10000 });
}

/**
 * Verify user is authenticated (check for auth token and dashboard access)
 */
export async function verifyAuthenticated(page: Page): Promise<void> {
  const token = await getAuthToken(page);
  expect(token).toBeTruthy();

  // Should be able to navigate to protected dashboard
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Should NOT be redirected to login
  expect(page.url()).toContain("/");
  expect(page.url()).not.toContain("/auth/login");
}

/**
 * Verify user is not authenticated (no auth token)
 */
export async function verifyNotAuthenticated(page: Page): Promise<void> {
  const token = await getAuthToken(page);
  expect(token).toBeNull();

  // Navigating to protected route should redirect to login
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Should be redirected to login
  expect(page.url()).toContain("/auth/login");
}
