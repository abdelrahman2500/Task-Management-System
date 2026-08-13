# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-resilience.spec.ts >> API Resilience >> should handle 404 not found errors
- Location: e2e\tests\api-resilience.spec.ts:88:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 429
```

# Test source

```ts
  6   |  * - Retry behavior
  7   |  * - Request timeout handling
  8   |  * - Network error recovery
  9   |  * - Error messages display
  10  |  */
  11  | 
  12  | import { test, expect } from "@playwright/test";
  13  | import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
  14  | import { cleanupUserData, createProject } from "../fixtures/database";
  15  | 
  16  | test.describe("API Resilience", () => {
  17  |   test("should handle 422 validation errors from API", async () => {
  18  |     // Register a user
  19  |     const testUser = generateTestUser("_resilience_422");
  20  |     const registered = await registerUser(testUser);
  21  | 
  22  |     // Try to create project with missing required fields
  23  |     const response = await fetch("http://localhost:3000/api/v1/projects", {
  24  |       method: "POST",
  25  |       headers: {
  26  |         "Content-Type": "application/json",
  27  |         Authorization: `Bearer ${registered.token}`,
  28  |       },
  29  |       body: JSON.stringify({
  30  |         // Missing name field
  31  |         description: "No name",
  32  |       }),
  33  |     });
  34  | 
  35  |     // Should return 422 (Unprocessable Entity)
  36  |     expect(response.status).toBe(422);
  37  | 
  38  |     // Cleanup
  39  |     await cleanupUserData(registered.token);
  40  |   });
  41  | 
  42  |   test("should handle 401 authentication errors", async () => {
  43  |     // Try to access without token
  44  |     const response = await fetch("http://localhost:3000/api/v1/projects", {
  45  |       method: "GET",
  46  |       headers: { "Content-Type": "application/json" },
  47  |     });
  48  | 
  49  |     // Should return 401
  50  |     expect(response.status).toBe(401);
  51  |   });
  52  | 
  53  |   test("should handle 403 forbidden errors", async () => {
  54  |     // Register two users
  55  |     const owner = generateTestUser("_owner");
  56  |     const ownerReg = await registerUser(owner);
  57  | 
  58  |     const other = generateTestUser("_other");
  59  |     const otherReg = await registerUser(other);
  60  | 
  61  |     // Owner creates a project
  62  |     const project = await createProject(ownerReg.token, {
  63  |       name: "Restricted Project",
  64  |       description: "Only for owner",
  65  |       status: "active",
  66  |     });
  67  | 
  68  |     // Other user tries to delete it
  69  |     const response = await fetch(
  70  |       `http://localhost:3000/api/v1/projects/${project.id}`,
  71  |       {
  72  |         method: "DELETE",
  73  |         headers: {
  74  |           "Content-Type": "application/json",
  75  |           Authorization: `Bearer ${otherReg.token}`,
  76  |         },
  77  |       },
  78  |     );
  79  | 
  80  |     // Should fail (403 or 401)
  81  |     expect([401, 403]).toContain(response.status);
  82  | 
  83  |     // Cleanup
  84  |     await cleanupUserData(ownerReg.token);
  85  |     await cleanupUserData(otherReg.token);
  86  |   });
  87  | 
  88  |   test("should handle 404 not found errors", async () => {
  89  |     // Register a user
  90  |     const testUser = generateTestUser("_resilience_404");
  91  |     const registered = await registerUser(testUser);
  92  | 
  93  |     // Try to fetch non-existent resource
  94  |     const response = await fetch(
  95  |       "http://localhost:3000/api/v1/projects/999999",
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
> 106 |     expect(response.status).toBe(404);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
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
  196 |       expect(response.status).toBe(200);
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
```