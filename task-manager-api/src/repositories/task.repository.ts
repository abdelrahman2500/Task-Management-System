import prisma from "../config/prisma.js";
import { TaskStatus, TaskPriority, Prisma } from "@prisma/client";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

const projectSelect = {
  id: true,
  name: true,
  status: true,
} satisfies Prisma.ProjectSelect;

const projectWithOwnerSelect = {
  ...projectSelect,
  ownerId: true,
} satisfies Prisma.ProjectSelect;

const taskSelect = {
  id: true,
  projectId: true,
  assigneeId: true,
  createdBy: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: safeUserSelect },
  creator: { select: safeUserSelect },
  project: { select: projectSelect },
} satisfies Prisma.TaskSelect;

const taskWithProjectOwnerSelect = {
  ...taskSelect,
  project: { select: projectWithOwnerSelect },
} satisfies Prisma.TaskSelect;

export class TaskRepository {
  async findAllPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: number;
    assigneeId?: number;
    userId?: number;
  }) {
    const {
      page,
      limit,
      search,
      status,
      priority,
      projectId,
      assigneeId,
      userId,
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (projectId !== undefined) {
      where.projectId = projectId;
    }

    if (assigneeId !== undefined) {
      where.assigneeId = assigneeId;
    }

    if (userId !== undefined) {
      where.OR = [
        ...(where.OR || []),
        { project: { ownerId: userId } },
        { project: { members: { some: { userId } } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: taskSelect,
      }),
      prisma.task.count({ where }),
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
    return await prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });
  }

  async findByIdWithProject(id: number) {
    return await prisma.task.findUnique({
      where: { id },
      select: taskWithProjectOwnerSelect,
    });
  }

  async create(data: {
    projectId: number;
    assigneeId?: number | null;
    createdBy: number;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
  }) {
    return await prisma.task.create({
      data: {
        projectId: data.projectId,
        assigneeId: data.assigneeId ?? undefined,
        createdBy: data.createdBy,
        title: data.title,
        description: data.description ?? undefined,
        status: data.status ?? TaskStatus.TODO,
        priority: data.priority ?? TaskPriority.MEDIUM,
        dueDate: data.dueDate ?? undefined,
      },
      select: taskSelect,
    });
  }

  async update(
    id: number,
    data: {
      projectId?: number;
      assigneeId?: number | null;
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    },
  ) {
    return await prisma.task.update({
      where: { id },
      data: {
        projectId: data.projectId,
        assigneeId:
          data.assigneeId === null
            ? null
            : data.assigneeId !== undefined
              ? data.assigneeId
              : undefined,
        title: data.title,
        description:
          data.description === null
            ? null
            : data.description !== undefined
              ? data.description
              : undefined,
        status: data.status,
        priority: data.priority,
        dueDate:
          data.dueDate === null
            ? null
            : data.dueDate !== undefined
              ? data.dueDate
              : undefined,
      },
      select: taskSelect,
    });
  }

  async deleteWithComments(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { taskId: id },
      });
      await tx.task.delete({
        where: { id },
      });
    });
  }

  async verifyAssigneeBelongsToProject(
    assigneeId: number,
    projectId: number,
  ): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        members: {
          where: { userId: assigneeId },
          take: 1,
        },
      },
    });

    if (!project) return false;
    if (project.ownerId === assigneeId) return true;
    return project.members.length > 0;
  }
}
