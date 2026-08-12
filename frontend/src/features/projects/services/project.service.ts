/**
 * Project service using generated OpenAPI types
 *
 * Delegates to centralized API client for type-safe operations.
 */

import { apiClient } from "../../../shared/api/client";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
  ListProjectsParams,
} from "../types";

export const projectService = {
  async getProjects(params?: ListProjectsParams) {
    return apiClient.projects.list(params);
  },

  async getById(id: number): Promise<Project> {
    const result = await apiClient.projects.getById(id);
    return result as Project;
  },

  async createProject(
    data: Omit<CreateProjectRequest, "ownerId">,
  ): Promise<Project> {
    const result = await apiClient.projects.create(
      data as CreateProjectRequest,
    );
    return result as Project;
  },

  async updateProject(
    id: number,
    data: UpdateProjectRequest,
  ): Promise<Project> {
    const result = await apiClient.projects.update(id, data);
    return result as Project;
  },

  async deleteProject(id: number): Promise<void> {
    return apiClient.projects.delete(id);
  },
};
