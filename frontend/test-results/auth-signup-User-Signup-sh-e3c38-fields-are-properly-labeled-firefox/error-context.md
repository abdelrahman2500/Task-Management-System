# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-signup.spec.ts >> User Signup >> should show form fields are properly labeled
- Location: e2e\tests\auth-signup.spec.ts:340:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('label:has-text("Password")')
Expected: visible
Error: strict mode violation: locator('label:has-text("Password")') resolved to 2 elements:
    1) <label for="password" class="block text-sm font-medium text-slate-700">Password</label> aka getByText('Password', { exact: true })
    2) <label for="confirmPassword" class="block text-sm font-medium text-slate-700">Confirm Password</label> aka getByText('Confirm Password')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('label:has-text("Password")')

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
      - heading "Create Account 🎉" [level=2] [ref=e42]
      - paragraph [ref=e43]: Join us to start managing your projects.
    - generic [ref=e44]:
      - generic [ref=e45]: Full Name
      - textbox "Full Name" [ref=e51]:
        - /placeholder: John Doe
    - generic [ref=e52]:
      - generic [ref=e53]: Email
      - textbox "Email" [ref=e59]:
        - /placeholder: john@example.com
    - generic [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]: Password
        - generic [ref=e63]:
          - textbox "Password" [ref=e68]:
            - /placeholder: ••••••••
          - button [ref=e69]
      - button "Show" [ref=e73]
    - generic [ref=e74]:
      - generic [ref=e75]:
        - generic [ref=e76]: Confirm Password
        - generic [ref=e77]:
          - textbox "Confirm Password" [ref=e82]:
            - /placeholder: ••••••••
          - button [ref=e83]
      - button "Show" [ref=e87]
    - button "Create Account" [ref=e88]
    - paragraph [ref=e90]:
      - text: Already have an account?
      - button "Sign In" [ref=e91]
```

# Test source

```ts
  247 |     await page.click('button:has-text("Sign In")');
  248 | 
  249 |     // Should navigate to login page
  250 |     await page.waitForURL("/auth/login");
  251 |     expect(page.url()).toContain("/auth/login");
  252 |   });
  253 | 
  254 |   test("should navigate to signup from login page", async ({ page }) => {
  255 |     await page.goto("/auth/login");
  256 |     await page.waitForLoadState("networkidle");
  257 | 
  258 |     // Click "Sign Up" link
  259 |     await page.click('button:has-text("Sign Up")');
  260 | 
  261 |     // Should navigate to signup page
  262 |     await page.waitForURL("/auth/signup");
  263 |     expect(page.url()).toContain("/auth/signup");
  264 |   });
  265 | 
  266 |   test("should allow user to login after signup", async ({ page }) => {
  267 |     const testUser = generateTestUser("_signup_then_login");
  268 | 
  269 |     // First signup
  270 |     await page.goto("/auth/signup");
  271 |     await page.waitForLoadState("networkidle");
  272 | 
  273 |     await page.fill("#name", testUser.name);
  274 |     await page.fill("#email", testUser.email);
  275 |     await page.fill("#password", testUser.password);
  276 |     await page.fill("#confirmPassword", testUser.password);
  277 | 
  278 |     await page.click('button:has-text("Create Account")');
  279 |     await page.waitForURL("/", { timeout: 10000 });
  280 | 
  281 |     // Get token and verify we're logged in
  282 |     let token = await getAuthToken(page);
  283 |     expect(token).toBeTruthy();
  284 | 
  285 |     // Logout by clearing token
  286 |     await page.evaluate(() => localStorage.removeItem("access_token"));
  287 | 
  288 |     // Try to access dashboard - should redirect to login
  289 |     await page.goto("/");
  290 |     await page.waitForURL("/auth/login");
  291 | 
  292 |     // Now login with the same credentials
  293 |     await page.fill("#email", testUser.email);
  294 |     await page.fill("#password", testUser.password);
  295 |     await page.click('button:has-text("Sign In")');
  296 | 
  297 |     // Should redirect to dashboard
  298 |     await page.waitForURL("/", { timeout: 10000 });
  299 | 
  300 |     // Verify auth token is stored
  301 |     token = await getAuthToken(page);
  302 |     expect(token).toBeTruthy();
  303 | 
  304 |     // Cleanup
  305 |     if (token) {
  306 |       await cleanupUserData(token);
  307 |     }
  308 |   });
  309 | 
  310 |   test("should prevent duplicate submission", async ({ page }) => {
  311 |     const testUser = generateTestUser("_signup_duplicate_submit");
  312 | 
  313 |     await page.goto("/auth/signup");
  314 |     await page.waitForLoadState("networkidle");
  315 | 
  316 |     // Fill form
  317 |     await page.fill("#name", testUser.name);
  318 |     await page.fill("#email", testUser.email);
  319 |     await page.fill("#password", testUser.password);
  320 |     await page.fill("#confirmPassword", testUser.password);
  321 | 
  322 |     // Click submit multiple times rapidly
  323 |     const submitButton = page.locator('button:has-text("Create Account")');
  324 |     await submitButton.click();
  325 |     await submitButton.click();
  326 |     await submitButton.click();
  327 | 
  328 |     // Should only create one user and redirect once
  329 |     await page.waitForURL("/", { timeout: 10000 });
  330 | 
  331 |     const token = await getAuthToken(page);
  332 |     expect(token).toBeTruthy();
  333 | 
  334 |     // Cleanup
  335 |     if (token) {
  336 |       await cleanupUserData(token);
  337 |     }
  338 |   });
  339 | 
  340 |   test("should show form fields are properly labeled", async ({ page }) => {
  341 |     await page.goto("/auth/signup");
  342 |     await page.waitForLoadState("networkidle");
  343 | 
  344 |     // Verify form fields exist with proper labels
  345 |     await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
  346 |     await expect(page.locator('label:has-text("Email")')).toBeVisible();
> 347 |     await expect(page.locator('label:has-text("Password")')).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  348 |     await expect(
  349 |       page.locator('label:has-text("Confirm Password")'),
  350 |     ).toBeVisible();
  351 |   });
  352 | });
  353 | 
```