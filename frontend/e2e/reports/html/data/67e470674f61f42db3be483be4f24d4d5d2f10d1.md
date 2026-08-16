# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-edge-cases.spec.ts >> Authentication Edge Cases >> should reject login with both fields empty
- Location: e2e\tests\auth-edge-cases.spec.ts:76:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Test source

```ts
  1   | /**
  2   |  * Authentication Edge Cases E2E Tests
  3   |  *
  4   |  * Covers edge cases and error scenarios:
  5   |  * - Empty field validation
  6   |  * - Invalid email formats
  7   |  * - Session management
  8   |  * - Token expiration behavior
  9   |  *
  10  |  * Uses shared fixture to reduce rate limiting impact
  11  |  */
  12  | 
  13  | import { test, expect } from "@playwright/test";
  14  | import {
  15  |   generateTestUser,
  16  |   getAuthToken,
  17  |   setAuthToken,
  18  |   registerUser,
  19  | } from "../fixtures/auth";
  20  | import { cleanupUserData } from "../fixtures/database";
  21  | 
  22  | let registered: any;
  23  | 
  24  | test.beforeAll(async () => {
  25  |   const testUser = generateTestUser("_auth_edge");
  26  |   registered = await registerUser(testUser);
  27  | });
  28  | 
  29  | test.afterAll(async () => {
  30  |   if (registered) {
  31  |     await cleanupUserData(registered.token);
  32  |   }
  33  | });
  34  | 
  35  | test.describe("Authentication Edge Cases", () => {
  36  |   test("should reject login with empty email field", async ({ page }) => {
  37  |     // Navigate to login page
  38  |     await page.goto("/auth/login");
  39  |     await page.waitForLoadState("networkidle");
  40  | 
  41  |     // Leave email empty, fill password
  42  |     await page.fill("#password", "SomePassword123!@#");
  43  | 
  44  |     // Try to submit
  45  |     await page.click('button[type="submit"]');
  46  | 
  47  |     // Wait for validation or error
  48  |     await page.waitForTimeout(1000);
  49  | 
  50  |     // Should still be on login page (not authenticated)
  51  |     expect(page.url()).toContain("/auth/login");
  52  |     const token = await getAuthToken(page);
  53  |     expect(token).toBeNull();
  54  |   });
  55  | 
  56  |   test("should reject login with empty password field", async ({ page }) => {
  57  |     // Navigate to login page
  58  |     await page.goto("/auth/login");
  59  |     await page.waitForLoadState("networkidle");
  60  | 
  61  |     // Fill email but leave password empty
  62  |     await page.fill("#email", registered.email);
  63  | 
  64  |     // Try to submit
  65  |     await page.click('button[type="submit"]');
  66  | 
  67  |     // Wait for validation or error
  68  |     await page.waitForTimeout(1000);
  69  | 
  70  |     // Should still be on login page
  71  |     expect(page.url()).toContain("/auth/login");
  72  |     const token = await getAuthToken(page);
  73  |     expect(token).toBeNull();
  74  |   });
  75  | 
  76  |   test("should reject login with both fields empty", async ({ page }) => {
  77  |     // Navigate to login page
  78  |     await page.goto("/auth/login");
> 79  |     await page.waitForLoadState("networkidle");
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  80  | 
  81  |     // Don't fill any fields, just try to submit
  82  |     await page.click('button[type="submit"]');
  83  | 
  84  |     // Wait for validation or error
  85  |     await page.waitForTimeout(1000);
  86  | 
  87  |     // Should still be on login page
  88  |     expect(page.url()).toContain("/auth/login");
  89  |     const token = await getAuthToken(page);
  90  |     expect(token).toBeNull();
  91  |   });
  92  | 
  93  |   test("should handle rapid consecutive login attempts gracefully", async ({
  94  |     page,
  95  |   }) => {
  96  |     // Use shared user
  97  |     await setAuthToken(page, registered.token);
  98  |     // Clear token for this test
  99  |     await page.evaluate(() => localStorage.removeItem("token"));
  100 | 
  101 |     // Navigate to login page
  102 |     await page.goto("/auth/login");
  103 |     await page.waitForLoadState("networkidle");
  104 | 
  105 |     // Attempt login with wrong password
  106 |     await page.fill("#email", registered.email);
  107 |     await page.fill("#password", "WrongPassword1");
  108 |     await page.click('button[type="submit"]');
  109 |     await page.waitForTimeout(500);
  110 | 
  111 |     // Attempt again immediately
  112 |     await page.fill("#email", registered.email);
  113 |     await page.fill("#password", "WrongPassword2");
  114 |     await page.click('button[type="submit"]');
  115 |     await page.waitForTimeout(500);
  116 | 
  117 |     // Attempt with correct password
  118 |     await page.fill("#email", registered.email);
  119 |     await page.fill("#password", registered.password);
  120 |     await page.click('button[type="submit"]');
  121 | 
  122 |     // Should eventually succeed or show rate limit
  123 |     await page.waitForTimeout(2000);
  124 | 
  125 |     // Either authenticated or on login page (rate limited)
  126 |     const token = await getAuthToken(page);
  127 |     const isOnLoginPage = page.url().includes("/auth/login");
  128 |     expect(token || isOnLoginPage).toBeTruthy();
  129 |   });
  130 | 
  131 |   test("should clear auth token on explicit logout", async ({ page }) => {
  132 |     // Set auth token
  133 |     await setAuthToken(page, registered.token);
  134 | 
  135 |     // Navigate to dashboard
  136 |     await page.goto("/");
  137 |     await page.waitForLoadState("networkidle");
  138 | 
  139 |     // Verify token exists
  140 |     let token = await getAuthToken(page);
  141 |     expect(token).toBeTruthy();
  142 | 
  143 |     // Find and click logout
  144 |     const logoutButton = page.locator(
  145 |       'button:has-text("Logout"), button:has-text("logout"), [data-test="logout-button"]',
  146 |     );
  147 |     if (await logoutButton.isVisible().catch(() => false)) {
  148 |       await logoutButton.click();
  149 |       await page.waitForTimeout(1000);
  150 |     }
  151 | 
  152 |     // Token should be cleared
  153 |     token = await getAuthToken(page);
  154 |     expect(token).toBeNull();
  155 |   });
  156 | 
  157 |   test("should preserve auth state through navigation", async ({ page }) => {
  158 |     // Set auth token
  159 |     await setAuthToken(page, registered.token);
  160 | 
  161 |     // Navigate to projects
  162 |     await page.goto("/projects");
  163 |     await page.waitForLoadState("networkidle");
  164 | 
  165 |     // Verify still authenticated
  166 |     let token = await getAuthToken(page);
  167 |     expect(token).toBeTruthy();
  168 | 
  169 |     // Navigate to tasks
  170 |     await page.goto("/tasks");
  171 |     await page.waitForLoadState("networkidle");
  172 | 
  173 |     // Verify still authenticated
  174 |     token = await getAuthToken(page);
  175 |     expect(token).toBeTruthy();
  176 | 
  177 |     // Navigate back to dashboard
  178 |     await page.goto("/");
  179 |     await page.waitForLoadState("networkidle");
```