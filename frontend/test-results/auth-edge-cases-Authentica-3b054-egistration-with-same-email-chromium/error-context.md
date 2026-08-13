# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-edge-cases.spec.ts >> Authentication Edge Cases >> should prevent re-registration with same email
- Location: e2e\tests\auth-edge-cases.spec.ts:206:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 429
Received array: [409, 422]
```

# Test source

```ts
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
  148 |     expect(token).toBeNull();
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
> 227 |     expect([409, 422]).toContain(response.status);
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  228 | 
  229 |     // Cleanup
  230 |     await cleanupUserData(registered.token);
  231 |   });
  232 | });
  233 | 
```