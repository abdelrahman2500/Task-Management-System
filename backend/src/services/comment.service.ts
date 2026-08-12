import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import {
  assertTaskAccess,
  assertCommentModifyAccess,
  assertCommentDeleteAccess,
} from "../lib/authorization";
import {
  parsePaginationParams,
  createPaginatedResponse,
} from "../lib/pagination";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "../schemas/comment.schemas";

export async function listComments(
  taskId: number,
  userId: number,
  page: number = 1,
  limit: number = 50,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Verify user has access to the task
  await assertTaskAccess(taskId, userId);

  const { skip, take } = parsePaginationParams({ page, limit });

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where: { taskId } }),
    prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
  ]);

  return createPaginatedResponse(comments, page, limit, total);
}

export async function createComment(
  taskId: number,
  data: CreateCommentInput,
  userId: number,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Verify user has access to the task
  await assertTaskAccess(taskId, userId);

  return prisma.comment.create({
    data: {
      body: data.body,
      taskId,
      authorId: userId,
    },
    select: {
      id: true,
      body: true,
      taskId: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateComment(
  commentId: number,
  data: UpdateCommentInput,
  userId: number,
) {
  await assertCommentModifyAccess(commentId, userId);

  return prisma.comment.update({
    where: { id: commentId },
    data: { body: data.body },
    select: {
      id: true,
      body: true,
      taskId: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteComment(commentId: number, userId: number) {
  await assertCommentDeleteAccess(commentId, userId);

  await prisma.comment.delete({ where: { id: commentId } });

  return { message: "Comment deleted successfully" };
}

// Note: Authorization helpers are now imported from authorization.ts at the top of the file
