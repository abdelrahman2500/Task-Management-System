# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authorization.spec.ts >> Authorization >> should handle validation errors gracefully
- Location: e2e\tests\authorization.spec.ts:136:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 422
Received: 429
```

# Test source

```ts
  55  |       status: "active",
  56  |     });
  57  | 
  58  |     // Access the project with token
  59  |     const response = await fetch(
  60  |       `http://localhost:3000/api/v1/projects/${project.id}`,
  61  |       {
  62  |         method: "GET",
  63  |         headers: {
  64  |           "Content-Type": "application/json",
  65  |           Authorization: `Bearer ${registered.token}`,
  66  |         },
  67  |       },
  68  |     );
  69  | 
  70  |     // Should succeed
  71  |     expect(response.status).toBe(200);
  72  | 
  73  |     // Cleanup
  74  |     await cleanupUserData(registered.token);
  75  |   });
  76  | 
  77  |   test("should prevent users from deleting other users' projects", async () => {
  78  |     // Register two users
  79  |     const owner = generateTestUser("_owner");
  80  |     const ownerReg = await registerUser(owner);
  81  | 
  82  |     const other = generateTestUser("_other");
  83  |     const otherReg = await registerUser(other);
  84  | 
  85  |     // Owner creates a project
  86  |     const project = await createProject(ownerReg.token, {
  87  |       name: "Owner's Project",
  88  |       description: "Only owner should delete",
  89  |       status: "active",
  90  |     });
  91  | 
  92  |     // Other user tries to delete it
  93  |     const response = await fetch(
  94  |       `http://localhost:3000/api/v1/projects/${project.id}`,
  95  |       {
  96  |         method: "DELETE",
  97  |         headers: {
  98  |           "Content-Type": "application/json",
  99  |           Authorization: `Bearer ${otherReg.token}`,
  100 |         },
  101 |       },
  102 |     );
  103 | 
  104 |     // Should fail (403 Forbidden or 401)
  105 |     expect([401, 403]).toContain(response.status);
  106 | 
  107 |     // Cleanup
  108 |     await cleanupUserData(ownerReg.token);
  109 |     await cleanupUserData(otherReg.token);
  110 |   });
  111 | 
  112 |   test("should handle 404 for non-existent resources", async () => {
  113 |     // Register a user
  114 |     const testUser = generateTestUser("_auth_404");
  115 |     const registered = await registerUser(testUser);
  116 | 
  117 |     // Try to access non-existent project
  118 |     const response = await fetch(
  119 |       "http://localhost:3000/api/v1/projects/999999",
  120 |       {
  121 |         method: "GET",
  122 |         headers: {
  123 |           "Content-Type": "application/json",
  124 |           Authorization: `Bearer ${registered.token}`,
  125 |         },
  126 |       },
  127 |     );
  128 | 
  129 |     // Should return 404
  130 |     expect(response.status).toBe(404);
  131 | 
  132 |     // Cleanup
  133 |     await cleanupUserData(registered.token);
  134 |   });
  135 | 
  136 |   test("should handle validation errors gracefully", async () => {
  137 |     // Register a user
  138 |     const testUser = generateTestUser("_auth_validation");
  139 |     const registered = await registerUser(testUser);
  140 | 
  141 |     // Try to create project with invalid data
  142 |     const response = await fetch("http://localhost:3000/api/v1/projects", {
  143 |       method: "POST",
  144 |       headers: {
  145 |         "Content-Type": "application/json",
  146 |         Authorization: `Bearer ${registered.token}`,
  147 |       },
  148 |       body: JSON.stringify({
  149 |         name: "", // Invalid: empty name
  150 |         description: "Missing name",
  151 |       }),
  152 |     });
  153 | 
  154 |     // Should return 422 (Unprocessable Entity)
> 155 |     expect(response.status).toBe(422);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  156 | 
  157 |     // Cleanup
  158 |     await cleanupUserData(registered.token);
  159 |   });
  160 | });
  161 | 
```