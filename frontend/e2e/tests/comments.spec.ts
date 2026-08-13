/**
 * Comments E2E Tests
 *
 * Covers:
 * - Comment creation on tasks
 * - Comment deletion
 * - Comment listing
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "../fixtures/auth";
import {
  cleanupUserData,
  createProject,
  createTask,
  createComment,
  deleteComment,
  listComments,
  type TestComment,
} from "../fixtures/database";

test.describe("Comments", () => {
  test("should create and retrieve a comment via API", async () => {
    // Register a user
    const testUser = generateTestUser("_comment_api");
    const registered = await registerUser(testUser);

    // Create a project and task
    const project = await createProject(registered.token, {
      name: "Comment Test Project",
      description: "For comment testing",
      status: "active",
    });

    const task = await createTask(registered.token, project.id, {
      title: "Task with Comments",
      description: "For testing comments",
      status: "todo",
      priority: "medium",
    });

    // Create a comment
    const comment = await createComment(
      registered.token,
      task.id,
      "This is a test comment",
    );

    // Verify comment was created
    expect(comment.id).toBeDefined();
    expect(comment.body).toBe("This is a test comment");
    expect(comment.taskId).toBe(task.id);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should list comments on a task via API", async () => {
    // Register a user
    const testUser = generateTestUser("_comment_list");
    const registered = await registerUser(testUser);

    // Create a project and task
    const project = await createProject(registered.token, {
      name: "Comment List Project",
      description: "For listing comments",
      status: "active",
    });

    const task = await createTask(registered.token, project.id, {
      title: "Task with Multiple Comments",
      status: "todo",
      priority: "medium",
    });

    // Create multiple comments
    const comment1 = await createComment(
      registered.token,
      task.id,
      "First comment",
    );

    const comment2 = await createComment(
      registered.token,
      task.id,
      "Second comment",
    );

    // List comments
    const comments = await listComments(registered.token, task.id, {});

    // Verify both comments are there
    expect(comments.data.length).toBeGreaterThanOrEqual(2);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should delete a comment via API", async () => {
    // Register a user
    const testUser = generateTestUser("_comment_delete");
    const registered = await registerUser(testUser);

    // Create a project and task
    const project = await createProject(registered.token, {
      name: "Comment Delete Project",
      description: "For deleting comments",
      status: "active",
    });

    const task = await createTask(registered.token, project.id, {
      title: "Task for comment deletion",
      status: "todo",
      priority: "medium",
    });

    // Create a comment
    const comment = await createComment(
      registered.token,
      task.id,
      "Comment to delete",
    );

    // Delete it
    await deleteComment(registered.token, comment.id);

    // List comments to verify it's gone
    const comments = await listComments(registered.token, task.id, {});
    const deleted = comments.data.find((c: TestComment) => c.id === comment.id);

    expect(deleted).toBeUndefined();

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
