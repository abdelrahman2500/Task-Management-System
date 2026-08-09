import { api } from "../../../shared/api/axios";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const projectService = {
  async getProjects() {
    const response = await api.get<ApiResponse<Project[]>>("/projects");

    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);

    return response.data.data;
  },

  async createProject(data: CreateProjectRequest) {
    const response = await api.post<ApiResponse<Project>>("/projects", data);

    return response.data.data;
  },
  async updateProject(id: number, data: UpdateProjectRequest) {
    const response = await api.patch<Project>(`/projects/${id}`, data);

    return response.data;
  },

  async deleteProject(id: number) {
    await api.delete(`/projects/${id}`);
  },
};
