/**
 * Task Status and Priority Enums
 *
 * CRITICAL: These must match the backend OpenAPI spec exactly
 * Backend values are lowercase: "todo", "in_progress", etc.
 */

/**
 * Task Feature Types
 *
 * Imports from generated OpenAPI types to maintain single source of truth.
 * Re-exports provide backwards compatibility with existing code.
 */

export type TaskStatusEnum = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent";

export type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksParams,
  ListTasksParams as GetTasksParams, // Backwards compat alias
  TasksResponse as ListTasksResponse, // Backwards compat alias
  PaginationMetadata,
} from "../../../shared/api/generated/types";
