import { ProjectStatus } from "@prisma/client";

export interface CreateProjectDto {
  ownerId: number;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
}

export interface UpdateProjectDto {
  ownerId?: number;
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}
