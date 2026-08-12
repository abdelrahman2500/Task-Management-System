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
  /** ISO date string */
  dueDate: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: number; name: string; email: string } | null;
  creator?: { id: number; name: string; email: string };
  project?: { id: number; name: string; status: string };
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  assigneeId?: number | null;
  projectId: number;
  /** ISO date string */
  dueDate?: string | null;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  projectId?: number;
  assigneeId?: number;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export interface ListTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
