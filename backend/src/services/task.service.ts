import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError, BadRequestError } from "../lib/errors";
import {
  assertTaskAccess,
  assertTaskModifyAccess,
  assertTaskDeleteAccess,
  assertProjectMember,
} from "../lib/authorization";
import {
  parsePaginationParams,
  createPaginatedResponse,
  type PaginatedResponse,
} from "../lib/pagination";
import type { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schemas";

export interface ListTasksFilters {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: number;
  assigneeId?: number;
}

export async function listTasks(
  projectId: number,
  userId: number,
  page: number = 1,
  limit: number = 20,
  filters?: ListTasksFilters,
) {
  await assertProjectMember(projectId, userId);

  const { skip, take } = parsePaginationParams({ page, limit });

  // Build where clause
  const where: any = { projectId };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.assigneeId) {
    where.assigneeId = filters.assigneeId;
  }

  // Execute count and findMany in parallel
  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, status: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return createPaginatedResponse(tasks, page, limit, total);
}

export async function getTask(taskId: number, userId: number) {
  await assertTaskAccess(taskId, userId);

  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function createTask(
  projectId: number,
  data: CreateTaskInput,
  userId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectMember(projectId, userId);

  // Validate assignee is a project member
  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });

    if (!isMember) {
      throw new BadRequestError("Assignee must be a member of the project");
    }
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "todo",
      priority: data.priority || "medium",
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId,
      createdBy: userId,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function updateTask(
  taskId: number,
  data: UpdateTaskInput,
  userId: number,
) {
  await assertTaskModifyAccess(taskId, userId);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Validate assignee is a project member
  if (data.assigneeId !== undefined) {
    if (data.assigneeId !== null) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: data.assigneeId,
          },
        },
      });

      if (!isMember) {
        throw new BadRequestError("Assignee must be a member of the project");
      }
    }
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function deleteTask(taskId: number, userId: number) {
  await assertTaskDeleteAccess(taskId, userId);

  await prisma.task.delete({ where: { id: taskId } });

  return { message: "Task deleted successfully" };
}

// Note: Authorization helpers are now imported from authorization.ts at the top of the file
