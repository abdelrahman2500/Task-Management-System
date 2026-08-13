/**
 * Task service using generated OpenAPI types
 *
 * Delegates to centralized API client for type-safe operations
 * with automatic enum conversion and error handling.
 * Supports AbortSignal propagation for request cancellation.
 */

import { apiClient } from "../../../shared/api/client";
import type { RequestOptions } from "../../../shared/api/cancellation";
import type { CreateTaskRequest, Task, ListTasksParams } from "../types";

export const taskServices = {
  async getTasks(
    params: ListTasksParams,
    options?: RequestOptions,
  ): Promise<Task[]> {
    // Use generated types from API client
    return apiClient.tasks.list(params, options);
  },

  async getTaskById(taskId: number, options?: RequestOptions): Promise<Task> {
    return apiClient.tasks.getById(taskId, options);
  },

  async createTask(
    payload: CreateTaskRequest,
    options?: RequestOptions,
  ): Promise<Task> {
    return apiClient.tasks.create(payload, options);
  },

  async updateTask(
    taskId: number,
    payload: Partial<CreateTaskRequest>,
    options?: RequestOptions,
  ): Promise<Task> {
    return apiClient.tasks.update(taskId, payload, options);
  },

  async deleteTask(taskId: number, options?: RequestOptions): Promise<void> {
    return apiClient.tasks.delete(taskId, options);
  },
};
