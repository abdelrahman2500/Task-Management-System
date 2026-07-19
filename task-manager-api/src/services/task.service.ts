import { TaskRepository } from "../repositories/task.repository.js";
import { TaskStatus, TaskPriority } from "@prisma/client";

export class TaskService {
  constructor(private repository = new TaskRepository()) {}

  async getAllTasks() {
    return await this.repository.findAll();
  }

  async getTaskById(id: number) {
    return await this.repository.findById(id);
  }

  async getTasksByProjectId(projectId: number) {
    return await this.repository.findByProjectId(projectId);
  }

  async createTask(data: {
    projectId: number;
    assigneeId?: number | null;
    createdBy: number;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
  }) {
    return await this.repository.create(data);
  }

  async updateTask(
    id: number,
    data: {
      projectId?: number;
      assigneeId?: number | null;
      createdBy?: number;
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    }
  ) {
    return await this.repository.update(id, data);
  }

  async deleteTask(id: number) {
    return await this.repository.delete(id);
  }
}
