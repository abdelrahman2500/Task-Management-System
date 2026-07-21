import { TaskRepository } from "../repositories/task.repository.js";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { AppError } from "../utils/errors/app-error.js";

export class TaskService {
  constructor(private repository = new TaskRepository()) {}

  async getAllTasks() {
    return this.repository.findAll();
  }

  async getTaskById(id: number) {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  }

  async getTasksByProjectId(projectId: number) {
    return this.repository.findByProjectId(projectId);
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
    return this.repository.delete(id);
  }
}
