# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-signup.spec.ts >> User Signup >> should show loading state during signup
- Location: e2e\tests\auth-signup.spec.ts:210:3

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: locator('button:has-text("Create Account")')
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" with timeout 5000ms
  - waiting for locator('button:has-text("Create Account")')

```

```yaml
- heading "Task Manager" [level=1]
- paragraph: Organize your projects, collaborate with your team, and deliver faster than ever.
- text: Unlimited Projects Team Collaboration Smart Task Tracking
- heading "500+" [level=2]
- paragraph: Projects
- heading "1200+" [level=2]
- paragraph: Tasks
- heading "Welcome Back 👋" [level=2]
- paragraph: Sign in to continue managing your projects.
- text: Email
- textbox "Email":
  - /placeholder: john@example.com
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
- button
- checkbox "Remember me"
- text: Remember me
- link "Forgot password?":
  - /url: "#"
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - button "Sign Up"
```

# Test source

```ts
  127 |     // Should show validation error
  128 |     const errorMessage = page.locator(
  129 |       "text=Password must be at least 8 characters",
  130 |     );
  131 |     await expect(errorMessage).toBeVisible();
  132 |   });
  133 | 
  134 |   test("should show validation error when passwords don't match", async ({
  135 |     page,
  136 |   }) => {
  137 |     const testUser = generateTestUser("_signup_password_mismatch");
  138 | 
  139 |     await page.goto("/auth/signup");
  140 |     await page.waitForLoadState("networkidle");
  141 | 
  142 |     // Fill form with mismatched passwords
  143 |     await page.fill("#name", testUser.name);
  144 |     await page.fill("#email", testUser.email);
  145 |     await page.fill("#password", testUser.password);
  146 |     await page.fill("#confirmPassword", "DifferentPassword123!");
  147 | 
  148 |     // Try to submit
  149 |     await page.click('button:has-text("Create Account")');
  150 | 
  151 |     // Wait for validation
  152 |     await page.waitForTimeout(500);
  153 | 
  154 |     // Should still be on signup page
  155 |     expect(page.url()).toContain("/auth/signup");
  156 | 
  157 |     // Should show validation error
  158 |     const errorMessage = page.locator("text=Passwords do not match");
  159 |     await expect(errorMessage).toBeVisible();
  160 |   });
  161 | 
  162 |   test("should show error for duplicate email", async ({ page }) => {
  163 |     const testUser = generateTestUser("_signup_duplicate");
  164 | 
  165 |     // Register the user first via signup
  166 |     await page.goto("/auth/signup");
  167 |     await page.waitForLoadState("networkidle");
  168 | 
  169 |     await page.fill("#name", testUser.name);
  170 |     await page.fill("#email", testUser.email);
  171 |     await page.fill("#password", testUser.password);
  172 |     await page.fill("#confirmPassword", testUser.password);
  173 | 
  174 |     await page.click('button:has-text("Create Account")');
  175 |     await page.waitForURL("/", { timeout: 10000 });
  176 | 
  177 |     // Get token to clean up later
  178 |     const token = await getAuthToken(page);
  179 | 
  180 |     // Logout to go back to signup
  181 |     await page.goto("/auth/login");
  182 |     await page.waitForLoadState("networkidle");
  183 | 
  184 |     // Try to signup again with same email
  185 |     await page.goto("/auth/signup");
  186 |     await page.waitForLoadState("networkidle");
  187 | 
  188 |     await page.fill("#name", "Different Name");
  189 |     await page.fill("#email", testUser.email);
  190 |     await page.fill("#password", testUser.password);
  191 |     await page.fill("#confirmPassword", testUser.password);
  192 | 
  193 |     await page.click('button:has-text("Create Account")');
  194 | 
  195 |     // Wait for response
  196 |     await page.waitForTimeout(1000);
  197 | 
  198 |     // Should show duplicate email error
  199 |     const errorMessage = page.locator(
  200 |       "text=An account with this email already exists",
  201 |     );
  202 |     await expect(errorMessage).toBeVisible();
  203 | 
  204 |     // Cleanup
  205 |     if (token) {
  206 |       await cleanupUserData(token);
  207 |     }
  208 |   });
  209 | 
  210 |   test("should show loading state during signup", async ({ page }) => {
  211 |     const testUser = generateTestUser("_signup_loading");
  212 | 
  213 |     await page.goto("/auth/signup");
  214 |     await page.waitForLoadState("networkidle");
  215 | 
  216 |     // Fill form
  217 |     await page.fill("#name", testUser.name);
  218 |     await page.fill("#email", testUser.email);
  219 |     await page.fill("#password", testUser.password);
  220 |     await page.fill("#confirmPassword", testUser.password);
  221 | 
  222 |     // Click submit and immediately check for loading state
  223 |     const submitButton = page.locator('button:has-text("Create Account")');
  224 |     await submitButton.click();
  225 | 
  226 |     // Button should be disabled/loading
> 227 |     await expect(submitButton).toBeDisabled();
      |                                ^ Error: expect(locator).toBeDisabled() failed
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
  325 |     await submitButton.click();
  326 |     await submitButton.click();
  327 | 
```