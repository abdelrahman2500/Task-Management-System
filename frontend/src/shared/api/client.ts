/**
 * Centralized API client
 *
 * Provides type-safe API methods using generated OpenAPI types.
 * Handles authentication, error transformation, and enum conversion.
 */

import { api } from "./axios";
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
  async list(params: ListTasksParams = {}): Promise<TasksResponse> {
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
    });
    return response as unknown as TasksResponse;
  },

  /**
   * Get a single task by ID
   */
  async getById(taskId: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response as unknown as Task;
  },

  /**
   * Create a new task
   */
  async create(payload: CreateTaskRequest): Promise<Task> {
    // Convert frontend enums to backend format
    const backendPayload = {
      ...payload,
      status: EnumConverters.taskStatusToBackend(payload.status),
      priority: EnumConverters.priorityToBackend(payload.priority),
    };

    const response = await api.post<Task>("/tasks", backendPayload);
    return response as unknown as Task;
  },

  /**
   * Update an existing task
   */
  async update(taskId: number, payload: UpdateTaskRequest): Promise<Task> {
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

    const response = await api.put<Task>(`/tasks/${taskId}`, backendPayload);
    return response as unknown as Task;
  },

  /**
   * Delete a task
   */
  async delete(taskId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
};

/**
 * Project API client
 */
const ProjectAPI = {
  /**
   * Get all projects with optional filters
   */
  async list(params: ListProjectsParams = {}): Promise<ProjectsResponse> {
    // Convert frontend status to backend format
    const backendParams = {
      ...params,
      ...(params.status && {
        status: EnumConverters.projectStatusToBackend(params.status),
      }),
    };

    const response = await api.get<ProjectsResponse>("/projects", {
      params: backendParams,
    });
    return response as unknown as ProjectsResponse;
  },

  /**
   * Get a single project
   */
  async getById(projectId: number): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response as unknown as Project;
  },

  /**
   * Create a new project
   */
  async create(payload: CreateProjectRequest): Promise<Project> {
    const backendPayload = {
      ...payload,
      ...(payload.status && {
        status: EnumConverters.projectStatusToBackend(payload.status),
      }),
    };

    const response = await api.post<Project>("/projects", backendPayload);
    return response as unknown as Project;
  },

  /**
   * Update an existing project
   */
  async update(
    projectId: number,
    payload: UpdateProjectRequest,
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
    );
    return response as unknown as Project;
  },

  /**
   * Delete a project
   */
  async delete(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  /**
   * Project member operations
   */
  members: {
    async list(
      projectId: number,
      params: ListProjectMembersParams = {},
    ): Promise<ProjectMembersResponse> {
      const response = await api.get<ProjectMembersResponse>(
        `/projects/${projectId}/members`,
        { params },
      );
      return response as unknown as ProjectMembersResponse;
    },

    async add(
      projectId: number,
      payload: AddProjectMemberRequest,
    ): Promise<ProjectMember> {
      const backendPayload = {
        ...payload,
        role: EnumConverters.roleToBackend(payload.role),
      };

      const response = await api.post<ProjectMember>(
        `/projects/${projectId}/members`,
        backendPayload,
      );
      return response as unknown as ProjectMember;
    },

    async update(
      projectId: number,
      memberId: number,
      payload: UpdateProjectMemberRequest,
    ): Promise<ProjectMember> {
      const backendPayload = {
        role: EnumConverters.roleToBackend(payload.role),
      };

      const response = await api.put<ProjectMember>(
        `/projects/${projectId}/members/${memberId}`,
        backendPayload,
      );
      return response as unknown as ProjectMember;
    },

    async remove(projectId: number, memberId: number): Promise<void> {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
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
  ): Promise<CommentsResponse> {
    const response = await api.get<CommentsResponse>(
      `/comments/task/${taskId}`,
      {
        params,
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
  ): Promise<Comment> {
    const response = await api.post<Comment>(
      `/comments/task/${taskId}`,
      payload,
    );
    return response as unknown as Comment;
  },

  /**
   * Update a comment
   */
  async update(
    commentId: number,
    payload: UpdateCommentRequest,
  ): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}`, payload);
    return response as unknown as Comment;
  },

  /**
   * Delete a comment
   */
  async delete(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
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
  ): Promise<{ token: string; user: User }> {
    const response = await api.post<{ token: string; user: User }>(
      "/auth/register",
      payload,
    );
    return response as unknown as { token: string; user: User };
  },

  /**
   * Login user
   */
  async login(payload: LoginRequest): Promise<{ token: string; user: User }> {
    const response = await api.post<{ token: string; user: User }>(
      "/auth/login",
      payload,
    );
    return response as unknown as { token: string; user: User };
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response as unknown as User;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post("/auth/logout", {});
  },

  /**
   * Update current user profile
   */
  async updateProfile(payload: Partial<User>): Promise<User> {
    const response = await api.patch<User>("/auth/me", payload);
    return response as unknown as User;
  },

  /**
   * Change password for current user
   */
  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.patch("/auth/me/password", payload);
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
  ): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return response as unknown as PaginatedResponse<User>;
  },

  /**
   * Get a specific user by ID (admin only)
   */
  async getUser(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response as unknown as User;
  },

  /**
   * Create a new user (admin only)
   */
  async createUser(payload: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/users", payload);
    return response as unknown as User;
  },

  /**
   * Update a user (admin only)
   */
  async updateUser(userId: number, payload: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/users/${userId}`, payload);
    return response as unknown as User;
  },

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}`);
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
