# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should allow user login via UI
- Location: e2e\tests\auth.spec.ts:21:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e8]:
    - heading "Task Manager" [level=1] [ref=e9]
    - paragraph [ref=e10]: Organize your projects, collaborate with your team, and deliver faster than ever.
    - generic [ref=e11]:
      - generic [ref=e12]: Unlimited Projects
      - generic [ref=e16]: Team Collaboration
      - generic [ref=e23]: Smart Task Tracking
    - generic [ref=e28]:
      - generic [ref=e29]:
        - heading "500+" [level=2] [ref=e30]
        - paragraph [ref=e31]: Projects
      - generic [ref=e32]:
        - heading "1200+" [level=2] [ref=e33]
        - paragraph [ref=e34]: Tasks
  - generic [ref=e37]:
    - generic [ref=e38]:
      - heading "Welcome Back 👋" [level=2] [ref=e39]
      - paragraph [ref=e40]: Sign in to continue managing your projects.
    - generic [ref=e41]:
      - generic [ref=e42]: Email
      - textbox "Email" [ref=e48]:
        - /placeholder: john@example.com
        - text: test-1786630275232_v4dkx0_login_ui@example.com
    - generic [ref=e49]:
      - generic [ref=e50]: Password
      - generic [ref=e51]:
        - textbox "Password" [ref=e56]:
          - /placeholder: ••••••••
          - text: TestPassword123!@#
        - button [ref=e57]
    - generic [ref=e61]:
      - generic [ref=e62]:
        - checkbox "Remember me" [ref=e63]
        - text: Remember me
      - link "Forgot password?" [ref=e64] [cursor=pointer]:
        - /url: "#"
    - button "Sign In" [ref=e65]
```

# Test source

```ts
  1   | /**
  2   |  * Authentication E2E Tests
  3   |  *
  4   |  * Covers:
  5   |  * - User login via API and UI
  6   |  * - User logout
  7   |  * - Auth token storage and retrieval
  8   |  * - Authentication state persistence
  9   |  */
  10  | 
  11  | import { test, expect } from "@playwright/test";
  12  | import {
  13  |   generateTestUser,
  14  |   getAuthToken,
  15  |   setAuthToken,
  16  |   registerUser,
  17  | } from "../fixtures/auth";
  18  | import { cleanupUserData } from "../fixtures/database";
  19  | 
  20  | test.describe("Authentication", () => {
  21  |   test("should allow user login via UI", async ({ page }) => {
  22  |     // Register a user via API first
  23  |     const testUser = generateTestUser("_login_ui");
  24  |     const registered = await registerUser(testUser);
  25  | 
  26  |     // Navigate to login page
  27  |     await page.goto("/auth/login");
  28  |     await page.waitForLoadState("networkidle");
  29  | 
  30  |     // Verify we're on the login page
  31  |     expect(page.url()).toContain("/auth/login");
  32  | 
  33  |     // Fill login form using ID attributes
  34  |     await page.fill("#email", testUser.email);
  35  |     await page.fill("#password", testUser.password);
  36  | 
  37  |     // Submit form
  38  |     await page.click('button[type="submit"]');
  39  | 
  40  |     // Should redirect to dashboard
> 41  |     await page.waitForURL("/", { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  42  |     await page.waitForLoadState("networkidle");
  43  | 
  44  |     // Verify auth token is stored
  45  |     const token = await getAuthToken(page);
  46  |     expect(token).toBeTruthy();
  47  | 
  48  |     // Cleanup
  49  |     if (token) {
  50  |       await cleanupUserData(token);
  51  |     }
  52  |   });
  53  | 
  54  |   test("should reject login with invalid credentials", async ({ page }) => {
  55  |     // Register a user via API
  56  |     const testUser = generateTestUser("_login_invalid");
  57  |     await registerUser(testUser);
  58  | 
  59  |     // Navigate to login page
  60  |     await page.goto("/auth/login");
  61  |     await page.waitForLoadState("networkidle");
  62  | 
  63  |     // Fill login form with wrong password
  64  |     await page.fill("#email", testUser.email);
  65  |     await page.fill("#password", "WrongPassword123!@#");
  66  | 
  67  |     // Submit form
  68  |     await page.click('button[type="submit"]');
  69  | 
  70  |     // Wait a moment for the request
  71  |     await page.waitForTimeout(2000);
  72  | 
  73  |     // Should still be on login page or show error
  74  |     const isOnLoginPage = page.url().includes("/auth/login");
  75  |     expect(isOnLoginPage).toBeTruthy();
  76  | 
  77  |     // Should NOT have auth token
  78  |     const token = await getAuthToken(page);
  79  |     expect(token).toBeNull();
  80  |   });
  81  | 
  82  |   test("should allow user logout", async ({ page }) => {
  83  |     // Register user via API
  84  |     const testUser = generateTestUser("_logout");
  85  |     const registered = await registerUser(testUser);
  86  | 
  87  |     // Set auth token
  88  |     await setAuthToken(page, registered.token);
  89  | 
  90  |     // Navigate to dashboard
  91  |     await page.goto("/");
  92  |     await page.waitForLoadState("networkidle");
  93  | 
  94  |     // Verify we're authenticated
  95  |     const token = await getAuthToken(page);
  96  |     expect(token).toBeTruthy();
  97  | 
  98  |     // Find and click logout button
  99  |     // Look for logout in menu or navigation
  100 |     const logoutButton = page.locator(
  101 |       'button:has-text("Logout"), button:has-text("logout"), [data-test="logout-button"]',
  102 |     );
  103 |     if (await logoutButton.isVisible().catch(() => false)) {
  104 |       await logoutButton.click();
  105 |       await page.waitForTimeout(1000);
  106 |     }
  107 | 
  108 |     // Cleanup
  109 |     await cleanupUserData(registered.token);
  110 |   });
  111 | 
  112 |   test("should persist auth token across page reloads", async ({ page }) => {
  113 |     // Register user via API
  114 |     const testUser = generateTestUser("_persist");
  115 |     const registered = await registerUser(testUser);
  116 | 
  117 |     // Set auth token
  118 |     await setAuthToken(page, registered.token);
  119 | 
  120 |     // Navigate to dashboard
  121 |     await page.goto("/");
  122 |     await page.waitForLoadState("networkidle");
  123 | 
  124 |     // Verify auth token exists
  125 |     let token = await getAuthToken(page);
  126 |     expect(token).toBeTruthy();
  127 | 
  128 |     // Reload page
  129 |     await page.reload();
  130 |     await page.waitForLoadState("networkidle");
  131 | 
  132 |     // Verify auth token still exists
  133 |     token = await getAuthToken(page);
  134 |     expect(token).toBeTruthy();
  135 | 
  136 |     // Should still be on dashboard (not redirected to login)
  137 |     expect(page.url()).not.toContain("/auth/login");
  138 | 
  139 |     // Cleanup
  140 |     await cleanupUserData(registered.token);
  141 |   });
```