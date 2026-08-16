# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crud-operations.spec.ts >> CRUD Operations >> should handle delete of non-existent resource
- Location: e2e\tests\crud-operations.spec.ts:326:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 429
```

# Test source

```ts
  243 |   });
  244 | 
  245 |   test("should prevent updating another user's task", async () => {
  246 |     // Register two users
  247 |     const user1 = generateTestUser("_owner_task_update");
  248 |     const user2 = generateTestUser("_other_task_update");
  249 |     const registered1 = await registerUser(user1);
  250 |     const registered2 = await registerUser(user2);
  251 | 
  252 |     // User1 creates project and task
  253 |     const project = await createProject(registered1.token, {
  254 |       name: "User1 Task Project",
  255 |     });
  256 |     const task = await createTask(registered1.token, project.id, {
  257 |       title: "User1 Task",
  258 |     });
  259 | 
  260 |     // User2 tries to update user1's task
  261 |     const response = await fetch(
  262 |       `http://localhost:3000/api/v1/tasks/${task.id}`,
  263 |       {
  264 |         method: "PUT",
  265 |         headers: {
  266 |           "Content-Type": "application/json",
  267 |           Authorization: `Bearer ${registered2.token}`,
  268 |         },
  269 |         body: JSON.stringify({
  270 |           status: "done",
  271 |         }),
  272 |       },
  273 |     );
  274 | 
  275 |     // Should be forbidden (user2 has no access to the project)
  276 |     expect(response.status).toBe(403);
  277 | 
  278 |     // Cleanup
  279 |     await cleanupUserData(registered1.token);
  280 |     await cleanupUserData(registered2.token);
  281 |   });
  282 | 
  283 |   test("should prevent updating another user's comment", async () => {
  284 |     // Register two users
  285 |     const user1 = generateTestUser("_owner_comment_update");
  286 |     const user2 = generateTestUser("_other_comment_update");
  287 |     const registered1 = await registerUser(user1);
  288 |     const registered2 = await registerUser(user2);
  289 | 
  290 |     // User1 creates project, task, and comment
  291 |     const project = await createProject(registered1.token, {
  292 |       name: "User1 Comment Project",
  293 |     });
  294 |     const task = await createTask(registered1.token, project.id, {
  295 |       title: "User1 Task",
  296 |     });
  297 |     const comment = await createComment(
  298 |       registered1.token,
  299 |       task.id,
  300 |       "User1 comment",
  301 |     );
  302 | 
  303 |     // User2 tries to update user1's comment
  304 |     const response = await fetch(
  305 |       `http://localhost:3000/api/v1/comments/${comment.id}`,
  306 |       {
  307 |         method: "PUT",
  308 |         headers: {
  309 |           "Content-Type": "application/json",
  310 |           Authorization: `Bearer ${registered2.token}`,
  311 |         },
  312 |         body: JSON.stringify({
  313 |           body: "Updated by User2",
  314 |         }),
  315 |       },
  316 |     );
  317 | 
  318 |     // Should be forbidden
  319 |     expect(response.status).toBe(403);
  320 | 
  321 |     // Cleanup
  322 |     await cleanupUserData(registered1.token);
  323 |     await cleanupUserData(registered2.token);
  324 |   });
  325 | 
  326 |   test("should handle delete of non-existent resource", async () => {
  327 |     // Register a user
  328 |     const testUser = generateTestUser("_delete_nonexistent");
  329 |     const registered = await registerUser(testUser);
  330 | 
  331 |     // Try to delete non-existent project
  332 |     const response = await fetch(
  333 |       "http://localhost:3000/api/v1/projects/99999",
  334 |       {
  335 |         method: "DELETE",
  336 |         headers: {
  337 |           Authorization: `Bearer ${registered.token}`,
  338 |         },
  339 |       },
  340 |     );
  341 | 
  342 |     // Should return 404
> 343 |     expect(response.status).toBe(404);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  344 | 
  345 |     // Cleanup
  346 |     await cleanupUserData(registered.token);
  347 |   });
  348 | 
  349 |   test("should prevent deleting another user's resource", async () => {
  350 |     // Register two users
  351 |     const user1 = generateTestUser("_owner_delete");
  352 |     const user2 = generateTestUser("_other_delete");
  353 |     const registered1 = await registerUser(user1);
  354 |     const registered2 = await registerUser(user2);
  355 | 
  356 |     // User1 creates a project
  357 |     const project = await createProject(registered1.token, {
  358 |       name: "Project to Not Delete",
  359 |     });
  360 | 
  361 |     // User2 tries to delete user1's project
  362 |     const response = await fetch(
  363 |       `http://localhost:3000/api/v1/projects/${project.id}`,
  364 |       {
  365 |         method: "DELETE",
  366 |         headers: {
  367 |           Authorization: `Bearer ${registered2.token}`,
  368 |         },
  369 |       },
  370 |     );
  371 | 
  372 |     // Should be forbidden
  373 |     expect(response.status).toBe(403);
  374 | 
  375 |     // Verify project still exists
  376 |     const getResponse = await getProject(registered1.token, project.id);
  377 |     expect(getResponse).toBeDefined();
  378 | 
  379 |     // Cleanup
  380 |     await cleanupUserData(registered1.token);
  381 |     await cleanupUserData(registered2.token);
  382 |   });
  383 | 
  384 |   test("should delete task successfully", async () => {
  385 |     // Register a user
  386 |     const testUser = generateTestUser("_delete_task");
  387 |     const registered = await registerUser(testUser);
  388 | 
  389 |     // Create project and task
  390 |     const project = await createProject(registered.token, {
  391 |       name: "Delete Task Project",
  392 |     });
  393 |     const task = await createTask(registered.token, project.id, {
  394 |       title: "Task to Delete",
  395 |     });
  396 | 
  397 |     // Delete the task
  398 |     await deleteTask(registered.token, task.id);
  399 | 
  400 |     // Try to get the task (should fail)
  401 |     const response = await fetch(
  402 |       `http://localhost:3000/api/v1/tasks/${task.id}`,
  403 |       {
  404 |         headers: {
  405 |           Authorization: `Bearer ${registered.token}`,
  406 |         },
  407 |       },
  408 |     );
  409 | 
  410 |     // Should return 404
  411 |     expect(response.status).toBe(404);
  412 | 
  413 |     // Cleanup
  414 |     await cleanupUserData(registered.token);
  415 |   });
  416 | });
  417 | 
```