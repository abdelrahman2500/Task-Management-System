import { ProjectRepository } from "../repositories/project.repository.js";
import { Role, ProjectStatus } from "@prisma/client";
import { AppError } from "../utils/errors/app-error.js";
import type { SafeUser } from "../repositories/auth.repository.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from "../schemas/project.schema.js";
import prisma from "../config/prisma.js";

const GLOBAL_ADMIN_ROLES: Role[] = [Role.OWNER, Role.ADMIN];
const PROJECT_WRITE_ROLES: Role[] = [Role.OWNER];
const PROJECT_READ_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER];

export class ProjectService {
  constructor(private repository = new ProjectRepository()) {}

  private isGlobalAdmin(user: SafeUser): boolean {
    return GLOBAL_ADMIN_ROLES.includes(user.role);
  }

  async resolveEffectiveProjectRole(
    currentUser: SafeUser,
    project: { ownerId: number; id: number },
  ): Promise<Role | null> {
    if (project.ownerId === currentUser.id) {
      return Role.OWNER;
    }
    const membership = await this.repository.getMember(project.id, currentUser.id);
    return membership?.role ?? null;
  }

  private async canReadProject(
    currentUser: SafeUser,
    project: { ownerId: number; id: number },
  ): Promise<boolean> {
    if (this.isGlobalAdmin(currentUser)) {
      return true;
    }
    const role = await this.resolveEffectiveProjectRole(currentUser, project);
    return role !== null && PROJECT_READ_ROLES.includes(role);
  }

  private async canWriteProject(
    currentUser: SafeUser,
    project: { ownerId: number; id: number },
  ): Promise<boolean> {
    if (this.isGlobalAdmin(currentUser)) {
      return true;
    }
    const role = await this.resolveEffectiveProjectRole(currentUser, project);
    return role !== null && PROJECT_WRITE_ROLES.includes(role);
  }

  async listProjects(currentUser: SafeUser, query: ListProjectsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const userId = this.isGlobalAdmin(currentUser) ? undefined : currentUser.id;

    return this.repository.findAllPaginated({
      page,
      limit,
      search: query.search,
      status: query.status,
      ownerId: query.ownerId,
      userId,
    });
  }

  async getProjectById(currentUser: SafeUser, id: number) {
    const project = await this.repository.findByIdWithDetails(id);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const canRead = await this.canReadProject(currentUser, {
      ownerId: project.ownerId,
      id: project.id,
    });
    if (!canRead) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this project");
    }

    return project;
  }

  async createProject(currentUser: SafeUser, data: CreateProjectInput) {
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ownerId: currentUser.id,
          name: data.name,
          description: data.description ?? undefined,
          status: data.status ?? ProjectStatus.ACTIVE,
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: currentUser.id,
          role: Role.OWNER,
        },
      });

      return project;
    });

    return result;
  }

  async updateProject(
    currentUser: SafeUser,
    id: number,
    data: UpdateProjectInput,
  ) {
    const project = await this.repository.findByIdWithDetails(id);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const canWrite = await this.canWriteProject(currentUser, {
      ownerId: project.ownerId,
      id: project.id,
    });
    if (!canWrite) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to update this project",
      );
    }

    if (data.ownerId !== undefined && !this.isGlobalAdmin(currentUser)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "Only global admins can change project ownership",
      );
    }

    return this.repository.update(id, {
      name: data.name,
      description: data.description,
      status: data.status,
      ownerId: data.ownerId,
    });
  }

  async deleteProject(currentUser: SafeUser, id: number) {
    const project = await this.repository.findByIdWithDetails(id);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const canWrite = await this.canWriteProject(currentUser, {
      ownerId: project.ownerId,
      id: project.id,
    });
    if (!canWrite) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to delete this project",
      );
    }

    await this.repository.deleteWithRelated(id);
  }
}
