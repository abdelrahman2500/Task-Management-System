# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: form-validation.spec.ts >> Form Validation >> should validate required comment body
- Location: e2e\tests\form-validation.spec.ts:246:3

# Error details

```
TypeError: fetch failed
```

# Test source

```ts
  1   | /**
  2   |  * Authentication Fixtures
  3   |  *
  4   |  * Provides helpers for user registration, login, and logout in E2E tests.
  5   |  * Manages test user creation and token storage.
  6   |  */
  7   | 
  8   | import type { Page } from "@playwright/test";
  9   | import { expect } from "@playwright/test";
  10  | 
  11  | const API_URL =
  12  |   process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";
  13  | 
  14  | export interface TestUser {
  15  |   id?: number;
  16  |   email: string;
  17  |   password: string;
  18  |   name: string;
  19  | }
  20  | 
  21  | interface ApiEnvelope<T> {
  22  |   success: boolean;
  23  |   data: T;
  24  | }
  25  | 
  26  | export interface AuthTokens {
  27  |   token: string;
  28  |   user: {
  29  |     id: number;
  30  |     email: string;
  31  |     name: string;
  32  |     role: string;
  33  |   };
  34  | }
  35  | 
  36  | /**
  37  |  * Generate a unique test user for each test
  38  |  */
  39  | export function generateTestUser(suffix: string = ""): TestUser {
  40  |   const timestamp = Date.now();
  41  |   const randomId = Math.random().toString(36).substring(2, 8);
  42  |   const uniqueId = `${timestamp}_${randomId}${suffix}`;
  43  | 
  44  |   return {
  45  |     email: `test-${uniqueId}@example.com`,
  46  |     password: "TestPassword123!@#",
  47  |     name: `Test User${suffix}`,
  48  |   };
  49  | }
  50  | 
  51  | /**
  52  |  * Register a new user via API
  53  |  */
  54  | export async function registerUser(user: TestUser): Promise<AuthTokens> {
> 55  |   const response = await fetch(`${API_URL}/auth/register`, {
      |                    ^ TypeError: fetch failed
  56  |     method: "POST",
  57  |     headers: {
  58  |       "Content-Type": "application/json",
  59  |       // The application correctly limits auth attempts per client IP. Each
  60  |       // isolated E2E user represents an independent client.
  61  |       "X-Forwarded-For": testClientIp(user.email),
  62  |     },
  63  |     body: JSON.stringify(user),
  64  |   });
  65  | 
  66  |   if (!response.ok) {
  67  |     const error = await response.json();
  68  |     throw new Error(`Registration failed: ${JSON.stringify(error)}`);
  69  |   }
  70  | 
  71  |   const payload = (await response.json()) as ApiEnvelope<AuthTokens>;
  72  | 
  73  |   // Add delay after registration to avoid rate limiting
  74  |   // (significantly increased to ensure rate limiter doesn't block)
  75  |   await new Promise((resolve) => setTimeout(resolve, 1200));
  76  | 
  77  |   return payload.data;
  78  | }
  79  | 
  80  | function testClientIp(seed: string): string {
  81  |   let hash = 0;
  82  |   for (const character of seed)
  83  |     hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  84  |   return `10.${(hash >>> 16) & 255}.${(hash >>> 8) & 255}.${hash & 255}`;
  85  | }
  86  | 
  87  | /**
  88  |  * Login user via API
  89  |  */
  90  | export async function loginUser(
  91  |   email: string,
  92  |   password: string,
  93  | ): Promise<AuthTokens> {
  94  |   const response = await fetch(`${API_URL}/auth/login`, {
  95  |     method: "POST",
  96  |     headers: { "Content-Type": "application/json" },
  97  |     body: JSON.stringify({ email, password }),
  98  |   });
  99  | 
  100 |   if (!response.ok) {
  101 |     const error = await response.json();
  102 |     throw new Error(`Login failed: ${JSON.stringify(error)}`);
  103 |   }
  104 | 
  105 |   const payload = (await response.json()) as ApiEnvelope<AuthTokens>;
  106 |   return payload.data;
  107 | }
  108 | 
  109 | /**
  110 |  * Store auth token in localStorage via page context
  111 |  */
  112 | export async function setAuthToken(page: Page, token: string): Promise<void> {
  113 |   await page.addInitScript((tokenValue) => {
  114 |     localStorage.setItem("accessToken", tokenValue);
  115 |   }, token);
  116 | }
  117 | 
  118 | /**
  119 |  * Get current auth token from localStorage
  120 |  */
  121 | export async function getAuthToken(page: Page): Promise<string | null> {
  122 |   return page.evaluate(() => localStorage.getItem("accessToken"));
  123 | }
  124 | 
  125 | /**
  126 |  * Clear auth token from localStorage
  127 |  */
  128 | export async function clearAuthToken(page: Page): Promise<void> {
  129 |   await page.evaluate(() => localStorage.removeItem("accessToken"));
  130 | }
  131 | 
  132 | /**
  133 |  * Login a user in the UI (navigate to login page and submit form)
  134 |  */
  135 | export async function loginInUI(
  136 |   page: Page,
  137 |   email: string,
  138 |   password: string,
  139 | ): Promise<void> {
  140 |   // Navigate to login page
  141 |   await page.goto("/auth/login");
  142 |   await page.waitForLoadState("networkidle");
  143 | 
  144 |   // Fill email and password using type selectors (more reliable than name)
  145 |   const emailInput = page.locator('input[type="email"]');
  146 |   const passwordInput = page.locator('input[type="password"]');
  147 | 
  148 |   await emailInput.fill(email);
  149 |   await passwordInput.fill(password);
  150 | 
  151 |   // Submit form
  152 |   const submitButton = page.locator('button[type="submit"]');
  153 |   await submitButton.click();
  154 | 
  155 |   // Wait for redirect to dashboard (successful login)
```