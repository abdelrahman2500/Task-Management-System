import { TaskStatus, TaskPriority } from "@prisma/client";

export interface CreateTaskDto {
  projectId: number;
  assigneeId?: number | null;
  createdBy: number;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  projectId?: number;
  assigneeId?: number | null;
  createdBy?: number;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}
