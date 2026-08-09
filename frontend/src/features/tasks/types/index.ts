export type TaskStatusEnum = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriorityEnum = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: number;
  createdBy: number;
  title: string;
  description: string | null;
  status: TaskStatusEnum;
  assigneeId: number | null;
  priority: TaskPriorityEnum;
  // ISO Date
  dueDate: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  assigneeId?: number | null;
  projectId: number;
  // ISO Date
  dueDate: string | null;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  projectId?: number;
}
export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, "projectId">>;
