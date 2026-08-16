# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> Route Protection >> should allow access to login page without token
- Location: e2e\tests\routes.spec.ts:31:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e8]:
    - heading "Task Manager" [level=1] [ref=e9]
    - paragraph [ref=e10]: Organize your projects, collaborate with your team, and deliver faster than ever.
    - generic [ref=e11]:
      - generic [ref=e12]: Unlimited Projects
      - generic [ref=e19]: Team Collaboration
      - generic [ref=e26]: Smart Task Tracking
    - generic [ref=e31]:
      - generic [ref=e32]:
        - heading "500+" [level=2] [ref=e33]
        - paragraph [ref=e34]: Projects
      - generic [ref=e35]:
        - heading "1200+" [level=2] [ref=e36]
        - paragraph [ref=e37]: Tasks
  - generic [ref=e40]:
    - generic [ref=e41]:
      - heading "Welcome Back 👋" [level=2] [ref=e42]
      - paragraph [ref=e43]: Sign in to continue managing your projects.
    - generic [ref=e44]:
      - generic [ref=e45]: Email
      - textbox "Email" [ref=e51]:
        - /placeholder: john@example.com
    - generic [ref=e52]:
      - generic [ref=e53]: Password
      - generic [ref=e54]:
        - textbox "Password" [ref=e59]:
          - /placeholder: ••••••••
        - button [ref=e60]
    - generic [ref=e64]:
      - generic [ref=e65]:
        - checkbox "Remember me" [ref=e66]
        - text: Remember me
      - link "Forgot password?" [ref=e67] [cursor=pointer]:
        - /url: "#"
    - button "Sign In" [ref=e68]
```

# Test source

```ts
  1   | /**
  2   |  * Route Protection E2E Tests
  3   |  *
  4   |  * Covers:
  5   |  * - Protected routes redirect to login when not authenticated
  6   |  * - Public routes are accessible without authentication
  7   |  * - Protected routes are accessible with valid token
  8   |  * - Route navigation works correctly
  9   |  */
  10  | 
  11  | import { test, expect } from "@playwright/test";
  12  | import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
  13  | import { cleanupUserData } from "../fixtures/database";
  14  | 
  15  | test.describe("Route Protection", () => {
  16  |   test("should redirect unauthenticated users to login page", async ({
  17  |     page,
  18  |   }) => {
  19  |     // Clear any existing auth
  20  |     await page.goto("/", { waitUntil: "networkidle" });
  21  |     await page.evaluate(() => localStorage.removeItem("accessToken"));
  22  | 
  23  |     // Reload
  24  |     await page.reload();
  25  |     await page.waitForLoadState("networkidle");
  26  | 
  27  |     // Should be redirected to login
  28  |     expect(page.url()).toContain("/auth/login");
  29  |   });
  30  | 
  31  |   test("should allow access to login page without token", async ({ page }) => {
  32  |     // Navigate to login page
  33  |     await page.goto("/auth/login");
> 34  |     await page.waitForLoadState("networkidle");
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  35  | 
  36  |     // Should be able to access without redirecting
  37  |     expect(page.url()).toContain("/auth/login");
  38  | 
  39  |     // Should see login form
  40  |     const emailInput = page.locator("#email");
  41  |     expect(await emailInput.isVisible()).toBeTruthy();
  42  |   });
  43  | 
  44  |   test("should allow authenticated users to access protected dashboard", async ({
  45  |     page,
  46  |   }) => {
  47  |     // Register and get token
  48  |     const testUser = generateTestUser("_dashboard");
  49  |     const registered = await registerUser(testUser);
  50  | 
  51  |     // Set auth token
  52  |     await setAuthToken(page, registered.token);
  53  | 
  54  |     // Navigate to dashboard
  55  |     await page.goto("/");
  56  |     await page.waitForLoadState("networkidle");
  57  | 
  58  |     // Should stay on dashboard (not redirected to login)
  59  |     expect(page.url()).not.toContain("/auth/login");
  60  | 
  61  |     // Cleanup
  62  |     await cleanupUserData(registered.token);
  63  |   });
  64  | 
  65  |   test("should redirect to login when accessing protected route without token", async ({
  66  |     page,
  67  |   }) => {
  68  |     // Establish a document origin before accessing local storage.
  69  |     await page.goto("/auth/login");
  70  |     await page.evaluate(() => localStorage.removeItem("accessToken"));
  71  | 
  72  |     // Navigate to protected route
  73  |     await page.goto("/projects");
  74  |     await page.waitForLoadState("networkidle");
  75  | 
  76  |     // Should be redirected to login
  77  |     expect(page.url()).toContain("/auth/login");
  78  |   });
  79  | 
  80  |   test("should maintain auth state during navigation", async ({ page }) => {
  81  |     // Register and get token
  82  |     const testUser = generateTestUser("_navigation");
  83  |     const registered = await registerUser(testUser);
  84  | 
  85  |     // Set auth token
  86  |     await setAuthToken(page, registered.token);
  87  | 
  88  |     // Navigate to dashboard
  89  |     await page.goto("/");
  90  |     await page.waitForLoadState("networkidle");
  91  | 
  92  |     // Should be on dashboard
  93  |     expect(page.url()).not.toContain("/auth/login");
  94  | 
  95  |     // Navigate to projects
  96  |     await page.goto("/projects");
  97  |     await page.waitForLoadState("networkidle");
  98  | 
  99  |     // Should still be authenticated (not on login page)
  100 |     expect(page.url()).not.toContain("/auth/login");
  101 | 
  102 |     // Cleanup
  103 |     await cleanupUserData(registered.token);
  104 |   });
  105 | 
  106 |   test("should allow navigation to tasks page when authenticated", async ({
  107 |     page,
  108 |   }) => {
  109 |     // Register and get token
  110 |     const testUser = generateTestUser("_tasks");
  111 |     const registered = await registerUser(testUser);
  112 | 
  113 |     // Set auth token
  114 |     await setAuthToken(page, registered.token);
  115 | 
  116 |     // Navigate to tasks
  117 |     await page.goto("/tasks");
  118 |     await page.waitForLoadState("networkidle");
  119 | 
  120 |     // Should be on tasks page
  121 |     expect(page.url()).toContain("/tasks");
  122 | 
  123 |     // Cleanup
  124 |     await cleanupUserData(registered.token);
  125 |   });
  126 | 
  127 |   test("should allow navigation to settings page when authenticated", async ({
  128 |     page,
  129 |   }) => {
  130 |     // Register and get token
  131 |     const testUser = generateTestUser("_settings");
  132 |     const registered = await registerUser(testUser);
  133 | 
  134 |     // Set auth token
```