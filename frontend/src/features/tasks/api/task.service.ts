/**
 * Task service using generated OpenAPI types
 *
 * Delegates to centralized API client for type-safe operations
 * with automatic enum conversion and error handling.
 */

import { apiClient } from "../../../shared/api/client";
import type { CreateTaskRequest, Task, ListTasksParams } from "../types";

export const taskServices = {
  async getTasks(params: ListTasksParams) {
    // Use generated types from API client
    return apiClient.tasks.list(params);
  },

  async getTaskById(taskId: number): Promise<Task> {
    return apiClient.tasks.getById(taskId);
  },

  async createTask(payload: CreateTaskRequest): Promise<Task> {
    return apiClient.tasks.create(payload);
  },

  async updateTask(
    taskId: number,
    payload: Partial<CreateTaskRequest>,
  ): Promise<Task> {
    return apiClient.tasks.update(taskId, payload);
  },

  async deleteTask(taskId: number): Promise<void> {
    return apiClient.tasks.delete(taskId);
  },
};
