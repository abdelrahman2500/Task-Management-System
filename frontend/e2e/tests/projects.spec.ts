/**
 * Projects E2E Tests
 *
 * Covers:
 * - Project creation and retrieval
 * - Project listing
 * - Project deletion
 * - Project member management
 */

import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser, setAuthToken } from "../fixtures/auth";
import {
  cleanupUserData,
  createProject,
  deleteProject,
  listProjects,
  addProjectMember,
  removeProjectMember,
  type TestProject,
} from "../fixtures/database";

test.describe("Projects", () => {
  test("should create and retrieve a project via API", async () => {
    // Register a user
    const testUser = generateTestUser("_proj_api");
    const registered = await registerUser(testUser);

    // Create a project via API
    const newProject = await createProject(registered.token, {
      name: "Test Project E2E",
      description: "A test project for E2E testing",
      status: "active",
    });

    // Verify project was created
    expect(newProject.id).toBeDefined();
    expect(newProject.name).toBe("Test Project E2E");
    expect(newProject.description).toBe("A test project for E2E testing");

    // Delete the project
    await deleteProject(registered.token, newProject.id);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should list projects via API", async () => {
    // Register a user
    const testUser = generateTestUser("_proj_list");
    const registered = await registerUser(testUser);

    // Create a test project
    const project1 = await createProject(registered.token, {
      name: "Project 1",
      description: "First project",
      status: "active",
    });

    const project2 = await createProject(registered.token, {
      name: "Project 2",
      description: "Second project",
      status: "active",
    });

    // List projects
    const projects = await listProjects(registered.token, {});

    // Verify both projects are in the list
    expect(projects.data.length).toBeGreaterThanOrEqual(2);

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should delete a project via API", async () => {
    // Register a user
    const testUser = generateTestUser("_proj_delete");
    const registered = await registerUser(testUser);

    // Create a project
    const project = await createProject(registered.token, {
      name: "Project to Delete",
      description: "Will be deleted",
      status: "active",
    });

    // Delete it
    await deleteProject(registered.token, project.id);

    // List projects to verify it's gone
    const projects = await listProjects(registered.token, {});
    const deleted = projects.data.find((p: TestProject) => p.id === project.id);

    expect(deleted).toBeUndefined();

    // Cleanup
    await cleanupUserData(registered.token);
  });

  test("should add and remove project members via API", async () => {
    // Register two users
    const owner = generateTestUser("_owner");
    const ownerReg = await registerUser(owner);

    const member = generateTestUser("_member");
    const memberReg = await registerUser(member);

    // Create a project as owner
    const project = await createProject(ownerReg.token, {
      name: "Project with Members",
      description: "Testing member management",
      status: "active",
    });

    // Add member to project
    const addedMember = await addProjectMember(
      ownerReg.token,
      project.id,
      memberReg.user.id,
      "member",
    );

    expect(addedMember.userId).toBe(memberReg.user.id);
    expect(addedMember.role).toBe("member");

    // Remove member from project (using userId, not member.id)
    await removeProjectMember(ownerReg.token, project.id, memberReg.user.id);

    // Cleanup
    await cleanupUserData(ownerReg.token);
    await cleanupUserData(memberReg.token);
  });

  test("should navigate to projects page when authenticated", async ({
    page,
  }) => {
    // Register a user
    const testUser = generateTestUser("_proj_nav");
    const registered = await registerUser(testUser);

    // Set auth token
    await setAuthToken(page, registered.token);

    // Navigate to projects page
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Should be on projects page
    expect(page.url()).toContain("/projects");

    // Cleanup
    await cleanupUserData(registered.token);
  });
});
