/**
 * Tasks E2E Tests
 *
 * Covers:
 * - Task creation and retrieval
 * - Task listing
 * - Task filtering by status and priority
 * - Task deletion
 * - Task with due date and assignment
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
import {
  cleanupUserData,
  createProject,
  createTask,
  deleteTask,
  listTasks,
  type TestTask,
} from "../fixtures/database";

test.describe("Tasks", () => {
  test("should create and retrieve a task via API", async () => {
    // Register a user
    const testUser = generateTestUser("_task_api");
    const registered = await registerUser(testUser);

    // Create a project first
    const project = await createProject(registered.token, {
      name: "Task Test Project",
      description: "For task testing",
      status: "active",
    });

    // Create a task
    const newTask = await createTask(registered.token, project.id, {
      title: "Test Task",
      description: "A test task",
      status: "todo",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    });

    // Verify task was created
    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe("Test Task");
    expect(newTask.status).toBe("todo");
    expect(newTask.priority).toBe("high");

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should list tasks via API", async () => {
    // Register a user
    const testUser = generateTestUser("_task_list");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Task List Project",
      description: "For listing tasks",
      status: "active",
    });

    // Create multiple tasks
    await createTask(registered.token, project.id, {
      title: "Task 1",
      description: "First task",
      status: "todo",
      priority: "low",
    });

    await createTask(registered.token, project.id, {
      title: "Task 2",
      description: "Second task",
      status: "in_progress",
      priority: "high",
    });

    // List tasks
    const tasks = await listTasks(registered.token, project.id, {
      projectId: project.id,
    });

    // Verify tasks are in the list
    expect(tasks.data.length).toBeGreaterThanOrEqual(2);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should filter tasks by status via API", async () => {
    // Register a user
    const testUser = generateTestUser("_task_filter");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Task Filter Project",
      description: "For filtering tasks",
      status: "active",
    });

    // Create tasks with different statuses
    await createTask(registered.token, project.id, {
      title: "Todo Task",
      status: "todo",
      priority: "medium",
    });

    await createTask(registered.token, project.id, {
      title: "In Progress Task",
      status: "in_progress",
      priority: "medium",
    });

    // List tasks filtered by status
    const todoTasks = await listTasks(registered.token, project.id, {
      projectId: project.id,
      status: "todo",
    });

    // Verify filtering works
    expect(todoTasks.data.length).toBeGreaterThan(0);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should delete a task via API", async () => {
    // Register a user
    const testUser = generateTestUser("_task_delete");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Task Delete Project",
      description: "For deleting tasks",
      status: "active",
    });

    // Create a task
    const task = await createTask(registered.token, project.id, {
      title: "Task to Delete",
      status: "todo",
      priority: "low",
    });

    // Delete it
    await deleteTask(registered.token, task.id);

    // Verify it's gone by listing
    const tasks = await listTasks(registered.token, project.id, {
      projectId: project.id,
    });

    const deleted = tasks.data.find((t: TestTask) => t.id === task.id);
    expect(deleted).toBeUndefined();

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should navigate to tasks page when authenticated", async ({ page }) => {
    // Register a user
    const testUser = generateTestUser("_task_nav");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to tasks page
    await page.goto("/tasks");
    await page.waitForLoadState("networkidle");

    // Should be on tasks page
    expect(page.url()).toContain("/tasks");

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
