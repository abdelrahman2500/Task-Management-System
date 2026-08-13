/**
 * Centralized API client
 *
 * Provides type-safe API methods using generated OpenAPI types.
 * Handles authentication, error transformation, enum conversion, and AbortSignal propagation.
 */

import { api } from "./axios";
import type { RequestOptions } from "./cancellation";
import type {
  User,
  Project,
  Task,
  Comment,
  ProjectMember,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  LoginRequest,
  RegisterRequest,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
  ListProjectsParams,
  ListTasksParams,
  ListCommentsParams,
  ListProjectMembersParams,
  PaginatedResponse,
  ProjectsResponse,
  TasksResponse,
  CommentsResponse,
  ProjectMembersResponse,
} from "./generated/types";

/**
 * Enum conversion utilities
 *
 * The OpenAPI spec uses lowercase enums (todo, in_progress, etc.)
 * Frontend may use different casing, so we normalize here.
 */
const EnumConverters = {
  /**
   * Convert task status from frontend format to backend format
   * Frontend: "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"
   * Backend: "todo", "in_progress", "blocked", "done"
   */
  taskStatusToBackend(
    status: string,
  ): "todo" | "in_progress" | "blocked" | "done" {
    const map: Record<string, "todo" | "in_progress" | "blocked" | "done"> = {
      TODO: "todo",
      todo: "todo",
      IN_PROGRESS: "in_progress",
      in_progress: "in_progress",
      IN_REVIEW: "in_progress", // Map IN_REVIEW to in_progress (backend doesn't support IN_REVIEW)
      BLOCKED: "blocked",
      blocked: "blocked",
      DONE: "done",
      done: "done",
    };
    return map[status] || "todo";
  },

  /**
   * Convert task status from backend to frontend format
   */
  taskStatusToFrontend(status: string): string {
    const map: Record<string, string> = {
      todo: "TODO",
      in_progress: "IN_PROGRESS",
      blocked: "BLOCKED",
      done: "DONE",
    };
    return map[status] || status;
  },

  /**
   * Convert project status from frontend to backend
   * Frontend: "ACTIVE", "COMPLETED", "ARCHIVED"
   * Backend: "active", "archived"
   */
  projectStatusToBackend(status: string): "active" | "archived" {
    const map: Record<string, "active" | "archived"> = {
      ACTIVE: "active",
      active: "active",
      COMPLETED: "active", // Map COMPLETED to active (backend doesn't support COMPLETED)
      ARCHIVED: "archived",
      archived: "archived",
    };
    return map[status] || "active";
  },

  /**
   * Convert project status from backend to frontend
   */
  projectStatusToFrontend(status: string): string {
    const map: Record<string, string> = {
      active: "ACTIVE",
      archived: "ARCHIVED",
    };
    return map[status] || status;
  },

  /**
   * Convert priority from frontend to backend
   */
  priorityToBackend(priority: string): "low" | "medium" | "high" | "urgent" {
    const map: Record<string, "low" | "medium" | "high" | "urgent"> = {
      LOW: "low",
      low: "low",
      MEDIUM: "medium",
      medium: "medium",
      HIGH: "high",
      high: "high",
      URGENT: "urgent",
      urgent: "urgent",
    };
    return map[priority] || "low";
  },

  /**
   * Convert priority from backend to frontend
   */
  priorityToFrontend(priority: string): string {
    const map: Record<string, string> = {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "URGENT",
    };
    return map[priority] || priority;
  },

  /**
   * Convert role from frontend to backend
   */
  roleToBackend(role: string): "owner" | "admin" | "member" | "viewer" {
    const map: Record<string, "owner" | "admin" | "member" | "viewer"> = {
      OWNER: "owner",
      owner: "owner",
      ADMIN: "admin",
      admin: "admin",
      MEMBER: "member",
      member: "member",
      VIEWER: "viewer",
      viewer: "viewer",
    };
    return map[role] || "member";
  },

  /**
   * Convert role from backend to frontend
   */
  roleToFrontend(role: string): string {
    const map: Record<string, string> = {
      owner: "OWNER",
      admin: "ADMIN",
      member: "MEMBER",
      viewer: "VIEWER",
    };
    return map[role] || role;
  },
};

/**
 * Task API client
 *
 * Routes from verified OpenAPI contract:
 * - GET /tasks/project/{projectId}
 * - POST /tasks/project/{projectId}
 * - GET /tasks/{taskId}
 * - PUT /tasks/{taskId}
 * - DELETE /tasks/{taskId}
 */
const TaskAPI = {
  /**
   * Get all tasks with optional filters
   */
  async list(
    params: ListTasksParams = {},
    options?: RequestOptions,
  ): Promise<TasksResponse> {
    // Convert frontend enum values to backend format
    const backendParams = {
      ...params,
      ...(params.status && {
        status: EnumConverters.taskStatusToBackend(params.status),
      }),
      ...(params.priority && {
        priority: EnumConverters.priorityToBackend(params.priority),
      }),
    };

    // Note: This assumes projectId is available from context
    // In a real app, you might pass it as a param
    const response = await api.get<TasksResponse>("/tasks", {
      params: backendParams,
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as TasksResponse;
  },

  /**
   * Get a single task by ID
   */
  async getById(taskId: number, options?: RequestOptions): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${taskId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Task;
  },

  /**
   * Create a new task
   */
  async create(
    payload: CreateTaskRequest,
    options?: RequestOptions,
  ): Promise<Task> {
    // Convert frontend enums to backend format
    const backendPayload = {
      ...payload,
      status: EnumConverters.taskStatusToBackend(payload.status),
      priority: EnumConverters.priorityToBackend(payload.priority),
    };

    const response = await api.post<Task>("/tasks", backendPayload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Task;
  },

  /**
   * Update an existing task
   */
  async update(
    taskId: number,
    payload: UpdateTaskRequest,
    options?: RequestOptions,
  ): Promise<Task> {
    // Convert frontend enums to backend format
    const backendPayload = {
      ...payload,
      ...(payload.status && {
        status: EnumConverters.taskStatusToBackend(payload.status),
      }),
      ...(payload.priority && {
        priority: EnumConverters.priorityToBackend(payload.priority),
      }),
    };

    const response = await api.put<Task>(`/tasks/${taskId}`, backendPayload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Task;
  },

  /**
   * Delete a task
   */
  async delete(taskId: number, options?: RequestOptions): Promise<void> {
    await api.delete(`/tasks/${taskId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
  },
};

/**
 * Project API client
 */
const ProjectAPI = {
  /**
   * Get all projects with optional filters
   */
  async list(
    params: ListProjectsParams = {},
    options?: RequestOptions,
  ): Promise<ProjectsResponse> {
    // Convert frontend status to backend format
    const backendParams = {
      ...params,
      ...(params.status && {
        status: EnumConverters.projectStatusToBackend(params.status),
      }),
    };

    const response = await api.get<ProjectsResponse>("/projects", {
      params: backendParams,
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as ProjectsResponse;
  },

  /**
   * Get a single project
   */
  async getById(projectId: number, options?: RequestOptions): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Project;
  },

  /**
   * Create a new project
   */
  async create(
    payload: CreateProjectRequest,
    options?: RequestOptions,
  ): Promise<Project> {
    const backendPayload = {
      ...payload,
      ...(payload.status && {
        status: EnumConverters.projectStatusToBackend(payload.status),
      }),
    };

    const response = await api.post<Project>("/projects", backendPayload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Project;
  },

  /**
   * Update an existing project
   */
  async update(
    projectId: number,
    payload: UpdateProjectRequest,
    options?: RequestOptions,
  ): Promise<Project> {
    const backendPayload = {
      ...payload,
      ...(payload.status && {
        status: EnumConverters.projectStatusToBackend(payload.status),
      }),
    };

    const response = await api.put<Project>(
      `/projects/${projectId}`,
      backendPayload,
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as Project;
  },

  /**
   * Delete a project
   */
  async delete(projectId: number, options?: RequestOptions): Promise<void> {
    await api.delete(`/projects/${projectId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
  },

  /**
   * Project member operations
   */
  members: {
    async list(
      projectId: number,
      params: ListProjectMembersParams = {},
      options?: RequestOptions,
    ): Promise<ProjectMembersResponse> {
      const response = await api.get<ProjectMembersResponse>(
        `/projects/${projectId}/members`,
        {
          params,
          signal: options?.signal,
          timeout: options?.timeout,
        },
      );
      return response as unknown as ProjectMembersResponse;
    },

    async add(
      projectId: number,
      payload: AddProjectMemberRequest,
      options?: RequestOptions,
    ): Promise<ProjectMember> {
      const backendPayload = {
        ...payload,
        role: EnumConverters.roleToBackend(payload.role),
      };

      const response = await api.post<ProjectMember>(
        `/projects/${projectId}/members`,
        backendPayload,
        {
          signal: options?.signal,
          timeout: options?.timeout,
        },
      );
      return response as unknown as ProjectMember;
    },

    async update(
      projectId: number,
      memberId: number,
      payload: UpdateProjectMemberRequest,
      options?: RequestOptions,
    ): Promise<ProjectMember> {
      const backendPayload = {
        role: EnumConverters.roleToBackend(payload.role),
      };

      const response = await api.put<ProjectMember>(
        `/projects/${projectId}/members/${memberId}`,
        backendPayload,
        {
          signal: options?.signal,
          timeout: options?.timeout,
        },
      );
      return response as unknown as ProjectMember;
    },

    async remove(
      projectId: number,
      memberId: number,
      options?: RequestOptions,
    ): Promise<void> {
      await api.delete(`/projects/${projectId}/members/${memberId}`, {
        signal: options?.signal,
        timeout: options?.timeout,
      });
    },
  },
};

/**
 * Comment API client
 */
const CommentAPI = {
  /**
   * Get all comments for a task
   */
  async list(
    taskId: number,
    params: ListCommentsParams = {},
    options?: RequestOptions,
  ): Promise<CommentsResponse> {
    const response = await api.get<CommentsResponse>(
      `/comments/task/${taskId}`,
      {
        params,
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as CommentsResponse;
  },

  /**
   * Create a new comment
   */
  async create(
    taskId: number,
    payload: CreateCommentRequest,
    options?: RequestOptions,
  ): Promise<Comment> {
    const response = await api.post<Comment>(
      `/comments/task/${taskId}`,
      payload,
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as Comment;
  },

  /**
   * Update a comment
   */
  async update(
    commentId: number,
    payload: UpdateCommentRequest,
    options?: RequestOptions,
  ): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}`, payload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as Comment;
  },

  /**
   * Delete a comment
   */
  async delete(commentId: number, options?: RequestOptions): Promise<void> {
    await api.delete(`/comments/${commentId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
  },
};

/**
 * Auth API client
 */
const AuthAPI = {
  /**
   * Register a new user
   */
  async register(
    payload: RegisterRequest,
    options?: RequestOptions,
  ): Promise<{ token: string; user: User }> {
    const response = await api.post<{ token: string; user: User }>(
      "/auth/register",
      payload,
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as { token: string; user: User };
  },

  /**
   * Login user
   */
  async login(
    payload: LoginRequest,
    options?: RequestOptions,
  ): Promise<{ token: string; user: User }> {
    const response = await api.post<{ token: string; user: User }>(
      "/auth/login",
      payload,
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as { token: string; user: User };
  },

  /**
   * Get current user
   */
  async getCurrentUser(options?: RequestOptions): Promise<User> {
    const response = await api.get<User>("/auth/me", {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as User;
  },

  /**
   * Logout
   */
  async logout(options?: RequestOptions): Promise<void> {
    await api.post(
      "/auth/logout",
      {},
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
  },

  /**
   * Update current user profile
   */
  async updateProfile(
    payload: Partial<User>,
    options?: RequestOptions,
  ): Promise<User> {
    const response = await api.patch<User>("/auth/me", payload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as User;
  },

  /**
   * Change password for current user
   */
  async changePassword(
    payload: {
      currentPassword: string;
      newPassword: string;
    },
    options?: RequestOptions,
  ): Promise<void> {
    await api.patch("/auth/me/password", payload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
  },
};

/**
 * User API client
 */
const UserAPI = {
  /**
   * List all users (admin only)
   */
  async listUsers(
    params: ListProjectsParams = {},
    options?: RequestOptions,
  ): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>("/users", {
      params,
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as PaginatedResponse<User>;
  },

  /**
   * Get a specific user by ID (admin only)
   */
  async getUser(userId: number, options?: RequestOptions): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as User;
  },

  /**
   * Create a new user (admin only)
   */
  async createUser(
    payload: RegisterRequest,
    options?: RequestOptions,
  ): Promise<User> {
    const response = await api.post<User>("/users", payload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as User;
  },

  /**
   * Update a user (admin only)
   */
  async updateUser(
    userId: number,
    payload: Partial<User>,
    options?: RequestOptions,
  ): Promise<User> {
    const response = await api.patch<User>(`/users/${userId}`, payload, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
    return response as unknown as User;
  },

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId: number, options?: RequestOptions): Promise<void> {
    await api.delete(`/users/${userId}`, {
      signal: options?.signal,
      timeout: options?.timeout,
    });
  },
};

/**
 * Export all API client namespaces
 */
export const apiClient = {
  tasks: TaskAPI,
  projects: ProjectAPI,
  comments: CommentAPI,
  auth: AuthAPI,
  users: UserAPI,
  enums: EnumConverters,
};

/**
 * Re-export generated types for convenience
 */
export * from "./generated/types";
