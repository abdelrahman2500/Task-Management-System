import type { User } from "../auth/types";

export interface Project {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  status: ProjectStatus;

  createdAt: string;
  updatedAt: string;
  members: User[];
}

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface CreateProjectRequest {
  ownerId: number;
  name: string;
  description?: string;
  status: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}
