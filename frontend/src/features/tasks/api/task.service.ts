import type {
  CreateTaskRequest,
  GetTasksParams,
  Task,
  UpdateTaskRequest,
} from "../types";
import { api } from "../../../shared/api/axios";

export const taskServices = {
  async getTasks(params: GetTasksParams): Promise<Task[]> {
    const res = await api.get("/tasks", { params });
    return res.data.data;
  },

  async createTask(payload: CreateTaskRequest): Promise<Task> {
    const res = await api.post("/tasks", payload);
    return res.data;
  },

  async updateTask(taskId: number, payload: UpdateTaskRequest): Promise<Task> {
    const res = await api.patch(`/tasks/${taskId}`, payload);
    return res.data;
  },

  async getTaskById(taskId: number): Promise<Task> {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },

  async deleteTask(taskId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
};
