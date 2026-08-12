/**
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 *
 * These types are generated from the OpenAPI specification.
 * Source: ../../backend/src/config/openapi.ts
 * Generation Date: 2026-08-12
 *
 * To regenerate: npm run generate:types
 */

/**
 * Security schemes
 */
export interface BearerAuth {
  type: "http";
  scheme: "bearer";
  bearerFormat: "JWT";
}

/**
 * User object representing a registered user
 */
export interface User {
  /** Unique user identifier */
  id: number;
  /** User's full name */
  name: string;
  /** User's unique email address */
  email: string;
  /** Whether the user account is active */
  isActive: boolean;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

/**
 * Authentication response with user and token
 */
export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    /** JWT bearer token for authentication */
    token: string;
  };
}

/**
 * Project object
 */
export interface Project {
  /** Unique project identifier */
  id: number;
  /** Project name */
  name: string;
  /** Detailed project description */
  description: string | null;
  /** Project status: active or archived */
  status: "active" | "archived";
  /** User ID of the project owner */
  ownerId: number;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

/**
 * Project member with assigned role
 */
export interface ProjectMember {
  projectId: number;
  userId: number;
  /** Member's role in the project */
  role: "owner" | "admin" | "member" | "viewer";
  createdAt: string; // ISO 8601 date-time
  user: User;
}

/**
 * Task object with status and priority
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  /** Due date in YYYY-MM-DD format */
  dueDate: string | null;
  /** User ID of assigned team member */
  assigneeId: number | null;
  projectId: number;
  /** User ID who created the task */
  createdBy: number;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
  /** Assigned user (null if unassigned) */
  assignee?: User | null;
  creator?: User;
  project?: { id: number; name: string; status: string };
}

/**
 * Comment on a task
 */
export interface Comment {
  id: number;
  body: string;
  taskId: number;
  /** User ID of comment author */
  authorId: number;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
  author: User;
}

/**
 * Pagination information in list responses
 */
export interface PaginationMetadata {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Whether there are previous pages */
  hasPreviousPage: boolean;
}

/**
 * Error response with code, message, and optional details
 */
export interface ErrorResponse {
  success: boolean;
  error: {
    /** Error code for client-side handling */
    code: string;
    /** User-safe error message */
    message: string;
    /** Additional error details (validation errors, field-level issues) */
    details?: Record<string, any>;
    /** Unique request ID for error correlation */
    requestId: string;
  };
}

/**
 * Request types
 */

/** Register request body */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Create project request body */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: "active" | "archived";
}

/** Update project request body */
export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  status?: "active" | "archived";
}

/** Add project member request body */
export interface AddProjectMemberRequest {
  userId: number;
  role: "owner" | "admin" | "member" | "viewer";
}

/** Update project member role request body */
export interface UpdateProjectMemberRequest {
  role: "owner" | "admin" | "member" | "viewer";
}

/** Create task request body */
export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: number | null;
  projectId: number;
  /** Due date in YYYY-MM-DD format */
  dueDate?: string | null;
}

/** Update task request body */
export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: "todo" | "in_progress" | "blocked" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeId?: number | null;
  /** Due date in YYYY-MM-DD format */
  dueDate?: string | null;
}

/** Create comment request body */
export interface CreateCommentRequest {
  body: string;
}

/** Update comment request body */
export interface UpdateCommentRequest {
  body: string;
}

/**
 * Response types
 */

/** Paginated response envelope */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/** Single item response */
export interface ItemResponse<T> {
  data: T;
}

/** Success response without data */
export interface SuccessResponse {
  success: boolean;
}

/**
 * Query parameter types
 */

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "archived";
}

export interface ListTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "todo" | "in_progress" | "blocked" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  projectId?: number;
  assigneeId?: number;
}

export interface ListCommentsParams {
  page?: number;
  limit?: number;
}

export interface ListProjectMembersParams {
  page?: number;
  limit?: number;
}

/**
 * Convenience type aliases for common response patterns
 */
export type ProjectsResponse = PaginatedResponse<Project>;
export type TasksResponse = PaginatedResponse<Task>;
export type CommentsResponse = PaginatedResponse<Comment>;
export type ProjectMembersResponse = PaginatedResponse<ProjectMember>;
