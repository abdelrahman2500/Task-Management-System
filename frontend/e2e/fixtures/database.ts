/**
 * Database/Test Data Management Fixtures
 *
 * Provides helpers for:
 * - Creating and managing test data via API
 * - Cleaning up test data after tests
 * - Seeding database with consistent test data
 */

import type { AuthTokens } from "./auth";

const API_URL =
  process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}
export interface TestProject {
  id: number;
  name: string;
  description?: string;
}
export interface TestTask {
  id: number;
  title: string;
  status: string;
  priority: string;
}
export interface TestComment {
  id: number;
  body: string;
  taskId: number;
}
export interface TestProjectMember {
  id: number;
  userId: number;
  role: string;
}

async function responseData<T>(response: Response): Promise<T> {
  const json = (await response.json()) as any;
  // If response has data property, return it; otherwise assume it's the data itself
  return json.data !== undefined ? json.data : json;
}

/**
 * Extract full response with pagination metadata
 */
async function responseDataWithPagination<T>(
  response: Response,
): Promise<{ data: T[]; pagination?: any }> {
  const json = (await response.json()) as any;
  return {
    data: json.data || [],
    pagination: json.pagination,
  };
}

/**
 * Fetch helper with auth token
 */
async function apiRequest(
  method: string,
  endpoint: string,
  token?: string,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${API_URL}${endpoint}`, options);
}

/**
 * Add delay to reduce rate limiting impact
 * POST operations should have delays to avoid hitting rate limiter
 * Rate limit: 100 write requests per 15 minutes per user
 * Budget: ~9 seconds per write request for full safety margin
 */
async function delayAfterWrite(): Promise<void> {
  // 3000ms (3 seconds) delay after write operations for safety
  // This provides substantial buffer to prevent hitting the 100 req/15min limit
  // Expected total time per test: 3s * number_of_writes
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

/**
 * Create a project
 */
export async function createProject(
  token: string,
  projectData: {
    name: string;
    description?: string;
    status?: string;
  },
): Promise<TestProject> {
  const response = await apiRequest("POST", "/projects", token, projectData);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create project: ${JSON.stringify(error)}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestProject>(response);
}

/**
 * Get a project by ID
 */
export async function getProject(
  token: string,
  projectId: number,
): Promise<TestProject> {
  const response = await apiRequest("GET", `/projects/${projectId}`, token);

  if (!response.ok) {
    throw new Error(`Failed to get project ${projectId}`);
  }

  return responseData<TestProject>(response);
}

/**
 * Delete a project
 */
export async function deleteProject(
  token: string,
  projectId: number,
): Promise<void> {
  const response = await apiRequest("DELETE", `/projects/${projectId}`, token);

  if (!response.ok) {
    throw new Error(`Failed to delete project ${projectId}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();
}

/**
 * Create a task
 */
export async function createTask(
  token: string,
  projectId: number,
  taskData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: number;
  },
): Promise<TestTask> {
  const response = await apiRequest(
    "POST",
    `/tasks/project/${projectId}`,
    token,
    taskData,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create task: ${JSON.stringify(error)}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestTask>(response);
}

/**
 * Get a task by ID
 */
export async function getTask(
  token: string,
  taskId: number,
): Promise<TestTask> {
  const response = await apiRequest("GET", `/tasks/${taskId}`, token);

  if (!response.ok) {
    throw new Error(`Failed to get task ${taskId}`);
  }

  return responseData<TestTask>(response);
}

/**
 * Update a task
 */
export async function updateTask(
  token: string,
  taskId: number,
  taskData: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assigneeId: number;
  }>,
): Promise<TestTask> {
  const response = await apiRequest("PUT", `/tasks/${taskId}`, token, taskData);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update task: ${JSON.stringify(error)}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestTask>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(token: string, taskId: number): Promise<void> {
  const response = await apiRequest("DELETE", `/tasks/${taskId}`, token);

  if (!response.ok) {
    throw new Error(`Failed to delete task ${taskId}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  token: string,
  projectId: number,
  userId: number,
  role: string = "member",
): Promise<TestProjectMember> {
  const response = await apiRequest(
    "POST",
    `/projects/${projectId}/members`,
    token,
    { userId, role },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to add project member: ${JSON.stringify(error)}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestProjectMember>(response);
}

/**
 * Update project member role
 */
export async function updateProjectMember(
  token: string,
  projectId: number,
  memberId: number,
  role: string,
): Promise<TestProjectMember> {
  const response = await apiRequest(
    "PUT",
    `/projects/${projectId}/members/${memberId}`,
    token,
    { role },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to update project member: ${JSON.stringify(error)}`,
    );
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestProjectMember>(response);
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(
  token: string,
  projectId: number,
  memberId: number,
): Promise<void> {
  const response = await apiRequest(
    "DELETE",
    `/projects/${projectId}/members/${memberId}`,
    token,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to remove project member: ${JSON.stringify(error)}`,
    );
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();
}

/**
 * Create a comment on a task
 */
export async function createComment(
  token: string,
  taskId: number,
  data: { content?: string; body?: string } | string,
): Promise<TestComment> {
  // Support both string (legacy) and object with content/body
  const body =
    typeof data === "string" ? data : data.content || data.body || "";

  const response = await apiRequest("POST", `/comments/task/${taskId}`, token, {
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create comment: ${JSON.stringify(error)}`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();

  return responseData<TestComment>(response);
}

/**
 * Delete a comment
 */
export async function deleteComment(
  token: string,
  commentId: number,
): Promise<void> {
  const response = await apiRequest("DELETE", `/comments/${commentId}`, token);

  if (!response.ok) {
    throw new Error(`Failed to delete comment`);
  }

  // Add delay after write to avoid rate limiting
  await delayAfterWrite();
}

/**
 * Get list of comments for a task
 */
export async function listComments(
  token: string,
  taskId: number,
  params?: Record<string, string | number>,
): Promise<{
  data: TestComment[];
  pagination?: { total: number; totalPages: number };
}> {
  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const response = await apiRequest(
    "GET",
    `/comments/task/${taskId}${queryString}`,
    token,
  );

  if (!response.ok) {
    throw new Error(`Failed to list comments`);
  }

  return responseDataWithPagination<TestComment>(response);
}

/**
 * Get list of projects
 */
export async function listProjects(
  token: string,
  params?: Record<string, string | number>,
): Promise<{
  data: TestProject[];
  pagination?: { total: number; totalPages: number };
  total?: number;
  totalPages?: number;
}> {
  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const response = await apiRequest("GET", `/projects${queryString}`, token);

  if (!response.ok) {
    throw new Error(`Failed to list projects`);
  }

  const result = await responseDataWithPagination<TestProject>(response);
  // Support both pagination.total and direct total for backward compatibility
  return {
    ...result,
    total: result.pagination?.total,
    totalPages: result.pagination?.totalPages,
  };
}

/**
 * Get list of tasks
 */
export async function listTasks(
  token: string,
  projectId: number,
  params?: Record<string, string | number>,
): Promise<{
  data: TestTask[];
  pagination?: { total: number; totalPages: number };
  total?: number;
  totalPages?: number;
}> {
  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const response = await apiRequest(
    "GET",
    `/tasks/project/${projectId}${queryString}`,
    token,
  );

  if (!response.ok) {
    throw new Error(`Failed to list tasks`);
  }

  const result = await responseDataWithPagination<TestTask>(response);
  // Support both pagination.total and direct total for backward compatibility
  return {
    ...result,
    total: result.pagination?.total,
    totalPages: result.pagination?.totalPages,
  };
}

/**
 * Clean up a user's test data (projects, tasks, etc.)
 * Called after each test to ensure isolation
 * Includes retry logic for rate limit resilience
 * Errors during cleanup are logged but don't fail tests
 */
export async function cleanupUserData(token: string): Promise<void> {
  try {
    // List all projects with retry
    let projectsResponse;
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        projectsResponse = await listProjects(token);
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          // 1s, 2s, 3s
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (4 - retries)),
          );
        }
      }
    }

    if (!projectsResponse) {
      // Silently fail cleanup if we can't list projects
      // This prevents cascade failures from affecting subsequent tests
      console.warn(
        "Could not list projects for cleanup (likely rate limited), skipping cleanup",
      );
      return;
    }

    const projects = projectsResponse.data;

    // Delete all projects (cascades to tasks and comments)
    for (const project of projects) {
      try {
        await deleteProject(token, project.id);
      } catch (error) {
        // Silently skip failed deletes - better to leave data than fail test
        console.warn(`Failed to delete project ${project.id}:`, error);
      }
    }
  } catch (error) {
    // Silently ignore cleanup errors - they should not fail tests
    console.warn("Error during cleanup (silently ignored):", error);
  }
}

/**
 * Seed test data for a user
 */
export async function seedTestData(token: string): Promise<{
  project: TestProject;
  task: TestTask;
}> {
  // Create a project
  const project = await createProject(token, {
    name: "Test Project",
    description: "A project for E2E testing",
    status: "active",
  });

  // Create a task in the project
  const task = await createTask(token, project.id, {
    title: "Test Task",
    description: "A task for E2E testing",
    status: "todo",
    priority: "medium",
  });

  return { project, task };
}
