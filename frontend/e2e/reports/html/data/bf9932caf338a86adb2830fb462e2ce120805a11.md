# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-edge-cases.spec.ts >> Authentication Edge Cases >> should prevent re-registration with same email
- Location: e2e\tests\auth-edge-cases.spec.ts:204:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 429
Received array: [409, 422]
```

# Test source

```ts
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
  180 | 
  181 |     // Verify still authenticated
  182 |     token = await getAuthToken(page);
  183 |     expect(token).toBeTruthy();
  184 |   });
  185 | 
  186 |   test("should handle protected route access without token", async ({
  187 |     page,
  188 |   }) => {
  189 |     // Try to navigate directly to protected route without token
  190 |     await page.goto("/projects");
  191 |     await page.waitForLoadState("networkidle");
  192 | 
  193 |     // Should redirect to login
  194 |     expect(page.url()).toContain("/auth/login");
  195 | 
  196 |     // Try to navigate to tasks
  197 |     await page.goto("/tasks");
  198 |     await page.waitForLoadState("networkidle");
  199 | 
  200 |     // Should redirect to login
  201 |     expect(page.url()).toContain("/auth/login");
  202 |   });
  203 | 
  204 |   test("should prevent re-registration with same email", async () => {
  205 |     // Try to register again with same email
  206 |     const duplicate = { ...registered };
  207 |     duplicate.password = "DifferentPassword123!@#";
  208 | 
  209 |     // Try via API
  210 |     const response = await fetch("http://localhost:3000/api/v1/auth/register", {
  211 |       method: "POST",
  212 |       headers: { "Content-Type": "application/json" },
  213 |       body: JSON.stringify({
  214 |         name: duplicate.name,
  215 |         email: duplicate.email,
  216 |         password: duplicate.password,
  217 |       }),
  218 |     });
  219 | 
  220 |     // Should get a conflict error (409 or 422)
> 221 |     expect([409, 422]).toContain(response.status);
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  222 |   });
  223 | });
  224 | 
```