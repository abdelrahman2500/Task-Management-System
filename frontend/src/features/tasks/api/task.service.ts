import { api } from "../../../shared/api/axios";
import type {
  CreateTaskRequest,
  GetTasksParams,
  Task,
  UpdateTaskRequest,
  ListTasksResponse,
} from "../types";

export const taskServices = {
  async getTasks(params: GetTasksParams): Promise<ListTasksResponse> {
    return api.get<ListTasksResponse>("/tasks", {
      params,
    }) as unknown as Promise<ListTasksResponse>;
  },

  async getTaskById(taskId: number): Promise<Task> {
    return api.get<Task>(`/tasks/${taskId}`) as unknown as Promise<Task>;
  },

  async createTask(payload: CreateTaskRequest): Promise<Task> {
    return api.post<Task>("/tasks", payload) as unknown as Promise<Task>;
  },

  async updateTask(taskId: number, payload: UpdateTaskRequest): Promise<Task> {
    return api.patch<Task>(
      `/tasks/${taskId}`,
      payload,
    ) as unknown as Promise<Task>;
  },

  async deleteTask(taskId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
};
