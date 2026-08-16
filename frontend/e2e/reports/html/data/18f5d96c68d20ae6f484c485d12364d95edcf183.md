# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-signup.spec.ts >> User Signup >> should prevent duplicate submission
- Location: e2e\tests\auth-signup.spec.ts:310:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Create Account")')

```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - generic [ref=f1e8]:
    - heading "Task Manager" [level=1] [ref=f1e9]
    - paragraph [ref=f1e10]: Organize your projects, collaborate with your team, and deliver faster than ever.
    - generic [ref=f1e11]:
      - generic [ref=f1e12]: Unlimited Projects
      - generic [ref=f1e16]: Team Collaboration
      - generic [ref=f1e23]: Smart Task Tracking
    - generic [ref=f1e28]:
      - generic [ref=f1e29]:
        - heading "500+" [level=2] [ref=f1e30]
        - paragraph [ref=f1e31]: Projects
      - generic [ref=f1e32]:
        - heading "1200+" [level=2] [ref=f1e33]
        - paragraph [ref=f1e34]: Tasks
  - generic [ref=f1e37]:
    - generic [ref=f1e38]:
      - heading "Welcome Back 👋" [level=2] [ref=f1e39]
      - paragraph [ref=f1e40]: Sign in to continue managing your projects.
    - generic [ref=f1e41]:
      - generic [ref=f1e42]: Email
      - textbox "Email" [ref=f1e48]:
        - /placeholder: john@example.com
    - generic [ref=f1e49]:
      - generic [ref=f1e50]: Password
      - generic [ref=f1e51]:
        - textbox "Password" [ref=f1e56]:
          - /placeholder: ••••••••
        - button [ref=f1e57]
    - generic [ref=f1e61]:
      - generic [ref=f1e62]:
        - checkbox "Remember me" [ref=f1e63]
        - text: Remember me
      - link "Forgot password?" [ref=f1e64] [cursor=pointer]:
        - /url: "#"
    - button "Sign In" [ref=f1e65]
    - paragraph [ref=f1e67]:
      - text: Don't have an account?
      - button "Sign Up" [ref=f1e68]
```

# Test source

```ts
  225 | 
  226 |     // Button should be disabled/loading
  227 |     await expect(submitButton).toBeDisabled();
  228 | 
  229 |     // Wait for response and redirect
  230 |     await page.waitForURL("/", { timeout: 10000 });
  231 | 
  232 |     // Verify we're logged in
  233 |     const token = await getAuthToken(page);
  234 |     expect(token).toBeTruthy();
  235 | 
  236 |     // Cleanup
  237 |     if (token) {
  238 |       await cleanupUserData(token);
  239 |     }
  240 |   });
  241 | 
  242 |   test("should navigate to login from signup page", async ({ page }) => {
  243 |     await page.goto("/auth/signup");
  244 |     await page.waitForLoadState("networkidle");
  245 | 
  246 |     // Click "Sign In" link
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
> 325 |     await submitButton.click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  347 |     await expect(page.locator('label:has-text("Password")')).toBeVisible();
  348 |     await expect(
  349 |       page.locator('label:has-text("Confirm Password")'),
  350 |     ).toBeVisible();
  351 |   });
  352 | });
  353 | 
```