/**
 * Project service using generated OpenAPI types
 *
 * Delegates to centralized API client for type-safe operations.
 * Supports AbortSignal propagation for request cancellation.
 */

import { apiClient } from "../../../shared/api/client";
import type { RequestOptions } from "../../../shared/api/cancellation";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
  ListProjectsParams,
} from "../types";

export const projectService = {
  async getProjects(params?: ListProjectsParams, options?: RequestOptions) {
    return apiClient.projects.list(params, options);
  },

  async getById(id: number, options?: RequestOptions): Promise<Project> {
    const result = await apiClient.projects.getById(id, options);
    return result as Project;
  },

  async createProject(
    data: Omit<CreateProjectRequest, "ownerId">,
    options?: RequestOptions,
  ): Promise<Project> {
    const result = await apiClient.projects.create(
      data as CreateProjectRequest,
      options,
    );
    return result as Project;
  },

  async updateProject(
    id: number,
    data: UpdateProjectRequest,
    options?: RequestOptions,
  ): Promise<Project> {
    const result = await apiClient.projects.update(id, data, options);
    return result as Project;
  },

  async deleteProject(id: number, options?: RequestOptions): Promise<void> {
    return apiClient.projects.delete(id, options);
  },
};
