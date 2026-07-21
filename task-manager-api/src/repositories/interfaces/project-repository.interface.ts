import type { Project, ProjectMember, ProjectStatus } from "@prisma/client";

export interface CreateProjectRepositoryData {
  ownerId: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
}

export interface UpdateProjectRepositoryData {
  ownerId?: number;
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}

export interface ProjectRepositoryInterface {
  findAll(): Promise<Project[]>;
  findById(id: number): Promise<Project | null>;
  create(data: CreateProjectRepositoryData): Promise<Project>;
  update(id: number, data: UpdateProjectRepositoryData): Promise<Project>;
  delete(id: number): Promise<Project>;
  getProjectMember(
    projectId: number,
    userId: number,
  ): Promise<ProjectMember | null>;
}
