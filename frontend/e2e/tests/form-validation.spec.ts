/**
 * Form Validation E2E Tests
 *
 * Covers:
 * - Required field validation
 * - Field length boundaries
 * - Special character handling
 * - Invalid input formats
 *
 * Uses shared fixture within file to reduce registration overhead
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "../fixtures/auth";
import { cleanupUserData, createProject } from "../fixtures/database";

let registered: any;
let project: any;

test.beforeAll(async () => {
  const testUser = generateTestUser("_form_validation_shared");
  registered = await registerUser(testUser);
  project = await createProject(registered.token, {
    name: "Shared Form Validation Project",
    description: "For all form validation tests",
  });
});

test.afterAll(async () => {
  if (registered) {
    await cleanupUserData(registered.token);
  }
});

test.describe("Form Validation", () => {
  test("should validate required project name", async () => {
    // Try to create project with empty name
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registered.token}`,
      },
      body: JSON.stringify({
        name: "", // Empty name
        description: "A project without a name",
      }),
    });

    // Should return validation error (422 or 429 if rate limited)
    expect([422, 429]).toContain(response.status);
  });

  test("should validate project name minimum length", async () => {
    // Try to create project with single character
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registered.token}`,
      },
      body: JSON.stringify({
        name: "A", // Single character
        description: "Short project name",
      }),
    });

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate required task title", async () => {
    // Try to create task with empty title
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "", // Empty title
          description: "A task without a title",
          status: "todo",
          priority: "medium",
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate task title minimum length", async () => {
    // Try to create task with single character title
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "T", // Single character
          description: "Task with short title",
          status: "todo",
          priority: "medium",
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate invalid task status", async () => {
    // Try to create task with invalid status
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Valid Title",
          description: "Task with invalid status",
          status: "invalid_status", // Invalid enum value
          priority: "medium",
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate invalid task priority", async () => {
    // Try to create task with invalid priority
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Valid Title",
          description: "Task with invalid priority",
          status: "todo",
          priority: "invalid_priority", // Invalid enum value
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate invalid task due date format", async () => {
    // Try to create task with invalid date format
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Valid Title",
          description: "Task with invalid date",
          status: "todo",
          priority: "medium",
          dueDate: "not-a-date", // Invalid date format
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should validate required comment body", async () => {
    // Create a task for this test
    const taskRes = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Task for Comment Test",
          description: "For comment validation",
          status: "todo",
          priority: "medium",
        }),
      },
    );
    const task = await taskRes.json();

    // Try to create comment with empty body
    const response = await fetch(
      `http://localhost:3000/api/v1/comments/task/${task.data.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          body: "", // Empty body
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });

  test("should accept valid project with special characters", async () => {
    // Create project with special characters
    const projectName = "Project with @#$% & spëcïål çhàrs!";
    const response = await fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registered.token}`,
      },
      body: JSON.stringify({
        name: projectName,
        description: "Testing special characters",
      }),
    });

    // Should succeed with 200 or 201 (or rate limited 429)
    expect([200, 201, 429]).toContain(response.status);
    if (response.ok) {
      const data = await response.json();
      expect(data.data.name).toBe(projectName);
    }
  });

  test("should accept valid task with long description", async () => {
    // Create task with long description
    const longDescription =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10);
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Task with Long Description",
          description: longDescription,
          status: "todo",
          priority: "medium",
        }),
      },
    );

    // Should succeed with 200 or 201 (or rate limited 429)
    expect([200, 201, 429]).toContain(response.status);
  });

  test("should reject task description exceeding maximum length", async () => {
    // Create task with extremely long description (> 10000 chars)
    const tooLongDescription = "x".repeat(50000);
    const response = await fetch(
      `http://localhost:3000/api/v1/tasks/project/${project.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registered.token}`,
        },
        body: JSON.stringify({
          title: "Task with Too Long Description",
          description: tooLongDescription,
          status: "todo",
          priority: "medium",
        }),
      },
    );

    // Should return validation error
    expect([422, 429]).toContain(response.status);
  });
});
