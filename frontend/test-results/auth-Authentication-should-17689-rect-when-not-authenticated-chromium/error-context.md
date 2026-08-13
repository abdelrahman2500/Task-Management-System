# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should handle login page redirect when not authenticated
- Location: e2e\tests\auth.spec.ts:157:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/projects
Call log:
  - navigating to "http://localhost:5173/projects", waiting until "load"

```

# Test source

```ts
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
  142 | 
  143 |   test("should register new user via API", async () => {
  144 |     // Test user registration via API
  145 |     const testUser = generateTestUser("_api_register");
  146 |     const result = await registerUser(testUser);
  147 | 
  148 |     // Verify response
  149 |     expect(result).toHaveProperty("token");
  150 |     expect(result).toHaveProperty("user");
  151 |     expect(result.user.email).toBe(testUser.email);
  152 | 
  153 |     // Cleanup
  154 |     await cleanupUserData(result.token);
  155 |   });
  156 | 
  157 |   test("should handle login page redirect when not authenticated", async ({
  158 |     page,
  159 |   }) => {
  160 |     // Navigate to protected route without token
> 161 |     await page.goto("/projects");
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/projects
  162 |     await page.waitForLoadState("networkidle");
  163 | 
  164 |     // Should be redirected to login
  165 |     expect(page.url()).toContain("/auth/login");
  166 |   });
  167 | });
  168 | 
```