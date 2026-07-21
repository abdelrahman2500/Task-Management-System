import type { Task, TaskPriority, TaskStatus } from "@prisma/client";

export interface CreateTaskRepositoryData {
  projectId: number;
  assigneeId?: number | null;
  createdBy: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
}

export interface UpdateTaskRepositoryData {
  projectId?: number;
  assigneeId?: number | null;
  createdBy?: number;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface TaskRepositoryInterface {
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  findByProjectId(projectId: number): Promise<Task[]>;
  create(data: CreateTaskRepositoryData): Promise<Task>;
  update(id: number, data: UpdateTaskRepositoryData): Promise<Task>;
  delete(id: number): Promise<Task>;
}
