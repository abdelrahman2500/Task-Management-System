import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "../schemas/comment.schemas";

export async function listComments(taskId: number, userId: number) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertTaskAccess(task.projectId, userId);

  return prisma.comment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createComment(
  taskId: number,
  data: CreateCommentInput,
  userId: number,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertTaskAccess(task.projectId, userId);

  return prisma.comment.create({
    data: {
      body: data.body,
      taskId,
      authorId: userId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      task: {
        select: {
          id: true,
          title: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function updateComment(
  commentId: number,
  data: UpdateCommentInput,
  userId: number,
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      taskId: true,
      task: { select: { projectId: true } },
    },
  });

  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Only author can edit their comment
  if (comment.authorId !== userId) {
    throw new ForbiddenError("You can only edit your own comments");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { body: data.body },
    include: {
      author: { select: { id: true, name: true, email: true } },
      task: {
        select: {
          id: true,
          title: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function deleteComment(commentId: number, userId: number) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      taskId: true,
      task: { select: { projectId: true } },
    },
  });

  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Author can delete, or project admin can delete
  if (comment.authorId !== userId) {
    await assertProjectAdmin(comment.task.projectId, userId);
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return { message: "Comment deleted successfully" };
}

// Access helpers
async function assertTaskAccess(projectId: number, userId: number) {
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

async function assertProjectAdmin(projectId: number, userId: number) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  const isOwner = project?.ownerId === userId;
  const isAdmin =
    membership && (membership.role === "admin" || membership.role === "owner");

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError();
  }
}
