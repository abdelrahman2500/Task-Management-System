/**
 * CRUD Operations E2E Tests
 *
 * Covers:
 * - Create operations
 * - Read/retrieve operations
 * - Update/edit operations
 * - Delete operations
 * - Cross-user boundaries
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "../fixtures/auth";
import {
  cleanupUserData,
  createProject,
  createTask,
  createComment,
  updateTask,
  deleteTask,
  getProject,
  getTask,
} from "../fixtures/database";

test.describe("CRUD Operations", () => {
  test("should update project details", async () => {
    // Register a user
    const testUser = generateTestUser("_update_project");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Original Project Name",
      description: "Original description",
      status: "active",
    });

    // Update the project
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          name: "Updated Project Name",
          description: "Updated description",
          status: "archived",
        }),
      },
    );

    // Should succeed
    expect(response.status).toBe(200);
    const updated = await response.json();
    expect(updated.data.name).toBe("Updated Project Name");
    expect(updated.data.description).toBe("Updated description");
    expect(updated.data.status).toBe("archived");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should partially update project", async () => {
    // Register a user
    const testUser = generateTestUser("_partial_update_project");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Original Name",
      description: "Original description",
    });

    // Update only the name
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          name: "Updated Name Only",
        }),
      },
    );

    // Should succeed
    expect(response.status).toBe(200);
    const updated = await response.json();
    expect(updated.data.name).toBe("Updated Name Only");
    // Description should remain unchanged
    expect(updated.data.description).toBe("Original description");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should update task details", async () => {
    // Register a user
    const testUser = generateTestUser("_update_task");
    const registered = await registerUser(testUser);

    // Create project and task
    const project = await createProject(registered.token, {
      name: "Update Task Project",
    });
    const task = await createTask(registered.token, project.id, {
      title: "Original Task Title",
      description: "Original description",
      status: "todo",
      priority: "low",
    });

    // Update the task
    const updated = await updateTask(registered.token, task.id, {
      title: "Updated Task Title",
      description: "Updated description",
      status: "in_progress",
      priority: "high",
    });

    // Verify updates
    expect(updated.title).toBe("Updated Task Title");
    expect(updated.description).toBe("Updated description");
    expect(updated.status).toBe("in_progress");
    expect(updated.priority).toBe("high");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should update only task status", async () => {
    // Register a user
    const testUser = generateTestUser("_partial_update_task");
    const registered = await registerUser(testUser);

    // Create project and task
    const project = await createProject(registered.token, {
      name: "Partial Update Task Project",
    });
    const task = await createTask(registered.token, project.id, {
      title: "Task Title",
      description: "Task description",
      status: "todo",
      priority: "medium",
    });

    // Update only the status
    const updated = await updateTask(registered.token, task.id, {
      status: "done",
    });

    // Status should be updated
    expect(updated.status).toBe("done");
    // Other fields should remain unchanged
    expect(updated.title).toBe("Task Title");
    expect(updated.priority).toBe("medium");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should update comment body", async () => {
    // Register a user
    const testUser = generateTestUser("_update_comment");
    const registered = await registerUser(testUser);

    // Create project, task, and comment
    const project = await createProject(registered.token, {
      name: "Update Comment Project",
    });
    const task = await createTask(registered.token, project.id, {
      title: "Task for Comments",
    });
    const comment = await createComment(
      registered.token,
      task.id,
      "Original comment body",
    );

    // Update the comment
    const response = await fetch(
      `http://localhost:3000/api/v1/comments/${comment.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          body: "Updated comment body",
        }),
      },
    );

    // Should succeed
    expect(response.status).toBe(200);
    const updated = await response.json();
    expect(updated.data.body).toBe("Updated comment body");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should prevent updating another user's project", async () => {
    // Register two users
    const user1 = generateTestUser("_owner_update");
    const user2 = generateTestUser("_other_update");
    const registered1 = await registerUser(user1);
    const registered2 = await registerUser(user2);

    // User1 creates a project
    const project = await createProject(registered1.token, {
      name: "User1 Project",
    });

    // User2 tries to update user1's project
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered2.token}`,
        },
        body: JSON.stringify({
          name: "Updated by User2",
        }),
      },
    );

    // Should be forbidden
    expect(response.status).toBe(403);

    // Cleanup
    await cleanupUserData(registered1.token);
    await cleanupUserData(registered2.token);
  });

  test("should prevent updating another user's task", async () => {
    // Register two users
    const user1 = generateTestUser("_owner_task_update");
    const user2 = generateTestUser("_other_task_update");
    const registered1 = await registerUser(user1);
    const registered2 = await registerUser(user2);

    // User1 creates project and task
    const project = await createProject(registered1.token, {
      name: "User1 Task Project",
    });
    const task = await createTask(registered1.token, project.id, {
      title: "User1 Task",
    });

    // User2 tries to update user1's task
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/${task.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered2.token}`,
        },
        body: JSON.stringify({
          status: "done",
        }),
      },
    );

    // Should be forbidden (user2 has no access to the project)
    expect(response.status).toBe(403);

    // Cleanup
    await cleanupUserData(registered1.token);
    await cleanupUserData(registered2.token);
  });

  test("should prevent updating another user's comment", async () => {
    // Register two users
    const user1 = generateTestUser("_owner_comment_update");
    const user2 = generateTestUser("_other_comment_update");
    const registered1 = await registerUser(user1);
    const registered2 = await registerUser(user2);

    // User1 creates project, task, and comment
    const project = await createProject(registered1.token, {
      name: "User1 Comment Project",
    });
    const task = await createTask(registered1.token, project.id, {
      title: "User1 Task",
    });
    const comment = await createComment(
      registered1.token,
      task.id,
      "User1 comment",
    );

    // User2 tries to update user1's comment
    const response = await fetch(
      `http://localhost:3000/api/v1/comments/${comment.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered2.token}`,
        },
        body: JSON.stringify({
          body: "Updated by User2",
        }),
      },
    );

    // Should be forbidden
    expect(response.status).toBe(403);

    // Cleanup
    await cleanupUserData(registered1.token);
    await cleanupUserData(registered2.token);
  });

  test("should handle delete of non-existent resource", async () => {
    // Register a user
    const testUser = generateTestUser("_delete_nonexistent");
    const registered = await registerUser(testUser);

    // Try to delete non-existent project
    const response = await fetch(
      "http://localhost:3000/api/v1/projects/99999",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${registered.token}`,
        },
      },
    );

    // Should return 404
    expect(response.status).toBe(404);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should prevent deleting another user's resource", async () => {
    // Register two users
    const user1 = generateTestUser("_owner_delete");
    const user2 = generateTestUser("_other_delete");
    const registered1 = await registerUser(user1);
    const registered2 = await registerUser(user2);

    // User1 creates a project
    const project = await createProject(registered1.token, {
      name: "Project to Not Delete",
    });

    // User2 tries to delete user1's project
    const response = await fetch(
      `http://localhost:3000/api/v1/projects/${project.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${registered2.token}`,
        },
      },
    );

    // Should be forbidden
    expect(response.status).toBe(403);

    // Verify project still exists
    const getResponse = await getProject(registered1.token, project.id);
    expect(getResponse).toBeDefined();

    // Cleanup
    await cleanupUserData(registered1.token);
    await cleanupUserData(registered2.token);
  });

  test("should delete task successfully", async () => {
    // Register a user
    const testUser = generateTestUser("_delete_task");
    const registered = await registerUser(testUser);

    // Create project and task
    const project = await createProject(registered.token, {
      name: "Delete Task Project",
    });
    const task = await createTask(registered.token, project.id, {
      title: "Task to Delete",
    });

    // Delete the task
    await deleteTask(registered.token, task.id);

    // Try to get the task (should fail)
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/${task.id}`,
      {
        headers: {
          Authorization: `Bearer ${registered.token}`,
        },
      },
    );

    // Should return 404
    expect(response.status).toBe(404);

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
