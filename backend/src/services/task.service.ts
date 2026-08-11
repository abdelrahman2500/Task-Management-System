import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError, BadRequestError } from "../lib/errors";
import type { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schemas";

export async function listTasks(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAccess(projectId, userId);

  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, status: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTask(taskId: number, userId: number) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, status: true } },
    },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertProjectAccess(task.projectId, userId);

  return task;
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
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, createdBy: true, assigneeId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertTaskAccess(task, userId);

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
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, createdBy: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertTaskDeleteAccess(task, userId);

  await prisma.task.delete({ where: { id: taskId } });

  return { message: "Task deleted successfully" };
}

// Access helpers
async function assertProjectAccess(projectId: number, userId: number) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!membership && project?.ownerId !== userId) {
    throw new ForbiddenError();
  }
}

async function assertProjectMember(projectId: number, userId: number) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  const isOwner = project?.ownerId === userId;
  const isMember = membership && membership.role !== "viewer";

  if (!isOwner && !isMember) {
    throw new ForbiddenError("Only project members can create tasks");
  }
}

async function assertTaskAccess(
  task: { projectId: number; createdBy: number; assigneeId: number | null },
  userId: number,
) {
  // Owner can always modify
  if (task.createdBy === userId) return;

  // Assignee can modify
  if (task.assigneeId === userId) return;

  // Project admins can modify
  await assertProjectMember(task.projectId, userId);
}

async function assertTaskDeleteAccess(
  task: { projectId: number; createdBy: number },
  userId: number,
) {
  // Task creator can delete
  if (task.createdBy === userId) return;

  // Project admins can delete
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
  });

  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    select: { ownerId: true },
  });

  const isOwner = project?.ownerId === userId;
  const isAdmin =
    membership && (membership.role === "admin" || membership.role === "owner");

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError(
      "Only task creators and project admins can delete tasks",
    );
  }
}
