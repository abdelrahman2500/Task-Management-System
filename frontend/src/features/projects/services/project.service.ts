import { api } from "../../../shared/api/axios";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
  ListProjectsResponse,
  ListProjectsParams,
} from "../types";

export const projectService = {
  async getProjects(
    params?: ListProjectsParams,
  ): Promise<ListProjectsResponse> {
    return api.get<ListProjectsResponse>("/projects", {
      params,
    }) as unknown as Promise<ListProjectsResponse>;
  },

  async getById(id: number): Promise<Project> {
    return api.get<Project>(`/projects/${id}`) as unknown as Promise<Project>;
  },

  async createProject(
    data: Omit<CreateProjectRequest, "ownerId">,
  ): Promise<Project> {
    return api.post<Project>("/projects", data) as unknown as Promise<Project>;
  },

  async updateProject(
    id: number,
    data: UpdateProjectRequest,
  ): Promise<Project> {
    return api.patch<Project>(
      `/projects/${id}`,
      data,
    ) as unknown as Promise<Project>;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
