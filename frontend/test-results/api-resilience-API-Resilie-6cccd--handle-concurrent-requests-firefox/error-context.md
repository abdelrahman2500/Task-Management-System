# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-resilience.spec.ts >> API Resilience >> should handle concurrent requests
- Location: e2e\tests\api-resilience.spec.ts:173:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 429
```

# Test source

```ts
  96  |       {
  97  |         method: "GET",
  98  |         headers: {
  99  |           "Content-Type": "application/json",
  100 |           Authorization: `Bearer ${registered.token}`,
  101 |         },
  102 |       },
  103 |     );
  104 | 
  105 |     // Should return 404
  106 |     expect(response.status).toBe(404);
  107 | 
  108 |     // Cleanup
  109 |     await cleanupUserData(registered.token);
  110 |   });
  111 | 
  112 |   test("should handle successful responses correctly", async () => {
  113 |     // Register a user
  114 |     const testUser = generateTestUser("_resilience_200");
  115 |     const registered = await registerUser(testUser);
  116 | 
  117 |     // Create a project successfully
  118 |     const project = await createProject(registered.token, {
  119 |       name: "Success Test Project",
  120 |       description: "Should succeed",
  121 |       status: "active",
  122 |     });
  123 | 
  124 |     // Verify project was created
  125 |     expect(project.id).toBeDefined();
  126 |     expect(project.name).toBe("Success Test Project");
  127 | 
  128 |     // Cleanup
  129 |     await cleanupUserData(registered.token);
  130 |   });
  131 | 
  132 |   test("should show dashboard when authenticated", async ({ page }) => {
  133 |     // Register a user
  134 |     const testUser = generateTestUser("_resilience_ui");
  135 |     const registered = await registerUser(testUser);
  136 | 
  137 |     // Set auth token
  138 |     await setAuthToken(page, registered.token);
  139 | 
  140 |     // Navigate to dashboard
  141 |     await page.goto("/");
  142 |     await page.waitForLoadState("networkidle");
  143 | 
  144 |     // Should be on dashboard
  145 |     expect(page.url()).not.toContain("/auth/login");
  146 | 
  147 |     // Cleanup
  148 |     await cleanupUserData(registered.token);
  149 |   });
  150 | 
  151 |   test("should handle repeated API calls", async () => {
  152 |     // Register a user
  153 |     const testUser = generateTestUser("_resilience_repeat");
  154 |     const registered = await registerUser(testUser);
  155 | 
  156 |     // Make multiple API calls
  157 |     for (let i = 0; i < 3; i++) {
  158 |       const response = await fetch("http://localhost:3000/api/v1/projects", {
  159 |         method: "GET",
  160 |         headers: {
  161 |           "Content-Type": "application/json",
  162 |           Authorization: `Bearer ${registered.token}`,
  163 |         },
  164 |       });
  165 | 
  166 |       expect(response.status).toBe(200);
  167 |     }
  168 | 
  169 |     // Cleanup
  170 |     await cleanupUserData(registered.token);
  171 |   });
  172 | 
  173 |   test("should handle concurrent requests", async () => {
  174 |     // Register a user
  175 |     const testUser = generateTestUser("_resilience_concurrent");
  176 |     const registered = await registerUser(testUser);
  177 | 
  178 |     // Make multiple concurrent requests
  179 |     const requests = [];
  180 |     for (let i = 0; i < 5; i++) {
  181 |       requests.push(
  182 |         fetch("http://localhost:3000/api/v1/projects", {
  183 |           method: "GET",
  184 |           headers: {
  185 |             "Content-Type": "application/json",
  186 |             Authorization: `Bearer ${registered.token}`,
  187 |           },
  188 |         }),
  189 |       );
  190 |     }
  191 | 
  192 |     const responses = await Promise.all(requests);
  193 | 
  194 |     // All should succeed
  195 |     responses.forEach((response) => {
> 196 |       expect(response.status).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  197 |     });
  198 | 
  199 |     // Cleanup
  200 |     await cleanupUserData(registered.token);
  201 |   });
  202 | 
  203 |   test("should handle rate limiting gracefully", async () => {
  204 |     // Register a user
  205 |     const testUser = generateTestUser("_resilience_ratelimit");
  206 |     const registered = await registerUser(testUser);
  207 | 
  208 |     // Make many requests in quick succession (may trigger rate limiting)
  209 |     const requests = [];
  210 |     for (let i = 0; i < 10; i++) {
  211 |       requests.push(
  212 |         fetch("http://localhost:3000/api/v1/projects", {
  213 |           method: "GET",
  214 |           headers: {
  215 |             "Content-Type": "application/json",
  216 |             Authorization: `Bearer ${registered.token}`,
  217 |           },
  218 |         }),
  219 |       );
  220 |     }
  221 | 
  222 |     const responses = await Promise.all(requests);
  223 | 
  224 |     // Should get mostly 200s (some might be 429 if rate limited)
  225 |     let successCount = 0;
  226 |     let rateLimitCount = 0;
  227 | 
  228 |     responses.forEach((response) => {
  229 |       if (response.status === 200) {
  230 |         successCount++;
  231 |       } else if (response.status === 429) {
  232 |         rateLimitCount++;
  233 |       }
  234 |     });
  235 | 
  236 |     // Most should succeed
  237 |     expect(successCount).toBeGreaterThan(0);
  238 | 
  239 |     // Cleanup
  240 |     await cleanupUserData(registered.token);
  241 |   });
  242 | });
  243 | 
```