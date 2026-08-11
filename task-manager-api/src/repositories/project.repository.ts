import prisma from "../config/prisma.js";
import { ProjectStatus, Role, Prisma } from "@prisma/client";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: safeUserSelect },
} satisfies Prisma.ProjectSelect;

const projectWithCountsSelect = {
  ...projectSelect,
  _count: {
    select: {
      members: true,
      tasks: true,
    },
  },
} satisfies Prisma.ProjectSelect;

export type ProjectWithOwnerAndCounts = Prisma.ProjectGetPayload<{
  select: typeof projectWithCountsSelect;
}>;

export class ProjectRepository {
  async findAllPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProjectStatus;
    ownerId?: number;
    userId?: number;
  }) {
    const { page, limit, search, status, ownerId, userId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (ownerId !== undefined) {
      where.ownerId = ownerId;
    }

    if (userId !== undefined) {
      where.OR = [
        ...(where.OR || []),
        { ownerId: userId },
        { members: { some: { userId } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: projectWithCountsSelect,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByIdWithDetails(id: number) {
    return await prisma.project.findUnique({
      where: { id },
      select: {
        ...projectSelect,
        members: {
          select: {
            role: true,
            user: { select: safeUserSelect },
          },
        },
      },
    });
  }

  async create(data: {
    ownerId: number;
    name: string;
    description?: string | null;
    status?: ProjectStatus;
  }) {
    return await prisma.project.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        description: data.description ?? undefined,
        status: data.status ?? ProjectStatus.ACTIVE,
      },
      select: projectSelect,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
      ownerId?: number;
    },
  ) {
    return await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description:
          data.description === null
            ? null
            : data.description !== undefined
              ? data.description
              : undefined,
        status: data.status,
        ownerId: data.ownerId,
      },
      select: projectSelect,
    });
  }

  async deleteWithRelated(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { task: { projectId: id } },
      });
      await tx.task.deleteMany({
        where: { projectId: id },
      });
      await tx.projectMember.deleteMany({
        where: { projectId: id },
      });
      await tx.project.delete({
        where: { id },
      });
    });
  }

  async addMember(projectId: number, userId: number, role: Role) {
    return await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      update: { role },
      create: {
        projectId,
        userId,
        role,
      },
      select: {
        projectId: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: safeUserSelect },
      },
    });
  }

  async removeMember(projectId: number, userId: number): Promise<void> {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async getMember(projectId: number, userId: number) {
    return await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: {
        projectId: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: safeUserSelect },
      },
    });
  }
}
