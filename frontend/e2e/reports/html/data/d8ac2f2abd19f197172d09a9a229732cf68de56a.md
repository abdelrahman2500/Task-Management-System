# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-edge-cases.spec.ts >> Authentication Edge Cases >> should clear auth token on explicit logout
- Location: e2e\tests\auth-edge-cases.spec.ts:123:3

# Error details

```
Error: expect(received).toBeNull()

Received: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk1MiwiZW1haWwiOiJ0ZXN0LTE3ODY2MzAyMzU4NTlfNzRycW1tX3Rva2VuX2NsZWFyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzg2NjMwMjM3LCJleHAiOjE3ODcyMzUwMzcsImlzcyI6InRhc2stbWFuYWdlbWVudC1hcGkiLCJzdWIiOiI5NTIifQ.Ky5krygmRyWJJAmnbu8izBBkQgxgWPwC-b5w_XhilrM"
```

# Page snapshot

```yaml
- img "Loading" [ref=e4]
```

# Test source

```ts
  48  |     await page.waitForLoadState("networkidle");
  49  | 
  50  |     // Fill email but leave password empty
  51  |     await page.fill("#email", testUser.email);
  52  | 
  53  |     // Try to submit
  54  |     await page.click('button[type="submit"]');
  55  | 
  56  |     // Wait for validation or error
  57  |     await page.waitForTimeout(1000);
  58  | 
  59  |     // Should still be on login page
  60  |     expect(page.url()).toContain("/auth/login");
  61  |     const token = await getAuthToken(page);
  62  |     expect(token).toBeNull();
  63  |   });
  64  | 
  65  |   test("should reject login with both fields empty", async ({ page }) => {
  66  |     // Navigate to login page
  67  |     await page.goto("/auth/login");
  68  |     await page.waitForLoadState("networkidle");
  69  | 
  70  |     // Don't fill any fields, just try to submit
  71  |     await page.click('button[type="submit"]');
  72  | 
  73  |     // Wait for validation or error
  74  |     await page.waitForTimeout(1000);
  75  | 
  76  |     // Should still be on login page
  77  |     expect(page.url()).toContain("/auth/login");
  78  |     const token = await getAuthToken(page);
  79  |     expect(token).toBeNull();
  80  |   });
  81  | 
  82  |   test("should handle rapid consecutive login attempts gracefully", async ({
  83  |     page,
  84  |   }) => {
  85  |     // Register a user
  86  |     const testUser = generateTestUser("_rapid_login");
  87  |     await registerUser(testUser);
  88  | 
  89  |     // Navigate to login page
  90  |     await page.goto("/auth/login");
  91  |     await page.waitForLoadState("networkidle");
  92  | 
  93  |     // Attempt login with wrong password
  94  |     await page.fill("#email", testUser.email);
  95  |     await page.fill("#password", "WrongPassword1");
  96  |     await page.click('button[type="submit"]');
  97  |     await page.waitForTimeout(500);
  98  | 
  99  |     // Attempt again immediately
  100 |     await page.fill("#email", testUser.email);
  101 |     await page.fill("#password", "WrongPassword2");
  102 |     await page.click('button[type="submit"]');
  103 |     await page.waitForTimeout(500);
  104 | 
  105 |     // Attempt with correct password
  106 |     await page.fill("#email", testUser.email);
  107 |     await page.fill("#password", testUser.password);
  108 |     await page.click('button[type="submit"]');
  109 | 
  110 |     // Should eventually succeed or show rate limit
  111 |     await page.waitForTimeout(2000);
  112 | 
  113 |     // Either authenticated or on login page (rate limited)
  114 |     const token = await getAuthToken(page);
  115 |     const isOnLoginPage = page.url().includes("/auth/login");
  116 |     expect(token || isOnLoginPage).toBeTruthy();
  117 | 
  118 |     if (token) {
  119 |       await cleanupUserData(token);
  120 |     }
  121 |   });
  122 | 
  123 |   test("should clear auth token on explicit logout", async ({ page }) => {
  124 |     // Register and authenticate
  125 |     const testUser = generateTestUser("_token_clear");
  126 |     const registered = await registerUser(testUser);
  127 |     await setAuthToken(page, registered.token);
  128 | 
  129 |     // Navigate to dashboard
  130 |     await page.goto("/");
  131 |     await page.waitForLoadState("networkidle");
  132 | 
  133 |     // Verify token exists
  134 |     let token = await getAuthToken(page);
  135 |     expect(token).toBeTruthy();
  136 | 
  137 |     // Find and click logout
  138 |     const logoutButton = page.locator(
  139 |       'button:has-text("Logout"), button:has-text("logout"), [data-test="logout-button"]',
  140 |     );
  141 |     if (await logoutButton.isVisible().catch(() => false)) {
  142 |       await logoutButton.click();
  143 |       await page.waitForTimeout(1000);
  144 |     }
  145 | 
  146 |     // Token should be cleared
  147 |     token = await getAuthToken(page);
> 148 |     expect(token).toBeNull();
      |                   ^ Error: expect(received).toBeNull()
  149 | 
  150 |     // Cleanup
  151 |     await cleanupUserData(registered.token);
  152 |   });
  153 | 
  154 |   test("should preserve auth state through navigation", async ({ page }) => {
  155 |     // Register and authenticate
  156 |     const testUser = generateTestUser("_nav_persist");
  157 |     const registered = await registerUser(testUser);
  158 |     await setAuthToken(page, registered.token);
  159 | 
  160 |     // Navigate to projects
  161 |     await page.goto("/projects");
  162 |     await page.waitForLoadState("networkidle");
  163 | 
  164 |     // Verify still authenticated
  165 |     let token = await getAuthToken(page);
  166 |     expect(token).toBeTruthy();
  167 | 
  168 |     // Navigate to tasks
  169 |     await page.goto("/tasks");
  170 |     await page.waitForLoadState("networkidle");
  171 | 
  172 |     // Verify still authenticated
  173 |     token = await getAuthToken(page);
  174 |     expect(token).toBeTruthy();
  175 | 
  176 |     // Navigate back to dashboard
  177 |     await page.goto("/");
  178 |     await page.waitForLoadState("networkidle");
  179 | 
  180 |     // Verify still authenticated
  181 |     token = await getAuthToken(page);
  182 |     expect(token).toBeTruthy();
  183 | 
  184 |     // Cleanup
  185 |     await cleanupUserData(registered.token);
  186 |   });
  187 | 
  188 |   test("should handle protected route access without token", async ({
  189 |     page,
  190 |   }) => {
  191 |     // Try to navigate directly to protected route without token
  192 |     await page.goto("/projects");
  193 |     await page.waitForLoadState("networkidle");
  194 | 
  195 |     // Should redirect to login
  196 |     expect(page.url()).toContain("/auth/login");
  197 | 
  198 |     // Try to navigate to tasks
  199 |     await page.goto("/tasks");
  200 |     await page.waitForLoadState("networkidle");
  201 | 
  202 |     // Should redirect to login
  203 |     expect(page.url()).toContain("/auth/login");
  204 |   });
  205 | 
  206 |   test("should prevent re-registration with same email", async ({ page }) => {
  207 |     // Register a user via API
  208 |     const testUser = generateTestUser("_duplicate_email");
  209 |     const registered = await registerUser(testUser);
  210 | 
  211 |     // Try to register again with same email
  212 |     const duplicate = generateTestUser("_duplicate_email");
  213 |     duplicate.email = testUser.email; // Same email
  214 | 
  215 |     // Navigate to register page (if exists) or try via API
  216 |     const response = await fetch("http://localhost:3000/api/v1/auth/register", {
  217 |       method: "POST",
  218 |       headers: { "Content-Type": "application/json" },
  219 |       body: JSON.stringify({
  220 |         name: duplicate.name,
  221 |         email: duplicate.email,
  222 |         password: duplicate.password,
  223 |       }),
  224 |     });
  225 | 
  226 |     // Should get a conflict error (409 or 422)
  227 |     expect([409, 422]).toContain(response.status);
  228 | 
  229 |     // Cleanup
  230 |     await cleanupUserData(registered.token);
  231 |   });
  232 | });
  233 | 
```