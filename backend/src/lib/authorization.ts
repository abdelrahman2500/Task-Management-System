import { prisma } from "./prisma";
import { ForbiddenError, NotFoundError } from "./errors";
import type { MemberRole } from "@prisma/client";

/**
 * Authorization module for access control.
 * Provides centralized functions for checking project, task, and comment access.
 *
 * Role hierarchy:
 * - OWNER: Full project control, can manage members
 * - ADMIN: Can manage tasks and certain members, update project
 * - MEMBER: Can create/manage own tasks, participate in project
 * - VIEWER: Read-only access to project
 */

/**
 * Check if user has access to a project.
 * Access is granted if:
 * - User is the project owner OR
 * - User is a member of the project
 */
export async function assertProjectAccess(
  projectId: number,
  userId: number,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  // Owner always has access
  if (project.ownerId === userId) return;

  // Check if user is a member of the project
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    throw new ForbiddenError("You don't have access to this project");
  }
}

/**
 * Check if user has a specific role in a project.
 * Allows multiple allowed roles.
 */
export async function assertProjectRole(
  projectId: number,
  userId: number,
  allowedRoles: MemberRole[],
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  // Owner can perform any role-based action
  if (project.ownerId === userId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new ForbiddenError(
      `You don't have permission to perform this action. Required roles: ${allowedRoles.join(", ")}`,
    );
  }
}

/**
 * Check if user is project admin (owner or admin role).
 * Admins can manage tasks, members, and update project details.
 */
export async function assertProjectAdmin(
  projectId: number,
  userId: number,
): Promise<void> {
  await assertProjectRole(projectId, userId, ["admin", "owner"]);
}

/**
 * Check if user is project owner.
 * Only owners can delete projects and change ownership.
 */
export async function assertProjectOwner(
  projectId: number,
  userId: number,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  if (project.ownerId !== userId) {
    throw new ForbiddenError("Only the project owner can perform this action");
  }
}

/**
 * Check if user can perform member-level actions in a project.
 * Members can: create tasks, comment, be assigned tasks.
 * Viewers cannot perform member-level actions.
 */
export async function assertProjectMember(
  projectId: number,
  userId: number,
): Promise<void> {
  // Owners are automatically members
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  if (project.ownerId === userId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  // Viewers cannot perform member-level actions
  if (!membership || membership.role === "viewer") {
    throw new ForbiddenError(
      "You don't have permission to perform this action. Members and above can perform this action.",
    );
  }
}

/**
 * Get user's role in a project.
 * Returns the membership role or 'owner' if user is project owner.
 */
export async function getUserProjectRole(
  projectId: number,
  userId: number,
): Promise<MemberRole | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return null;

  if (project.ownerId === userId) return "owner";

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  return membership?.role ?? null;
}

/**
 * Check if user can access a task through project membership.
 */
export async function assertTaskAccess(
  taskId: number,
  userId: number,
): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  await assertProjectAccess(task.projectId, userId);
}

/**
 * Check if user can modify a task.
 * Task can be modified by:
 * - Task creator
 * - Assigned user
 * - Project admins
 */
export async function assertTaskModifyAccess(
  taskId: number,
  userId: number,
): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, createdBy: true, assigneeId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Task creator can modify
  if (task.createdBy === userId) return;

  // Assigned user can modify
  if (task.assigneeId === userId) return;

  // Project admins can modify
  try {
    await assertProjectAdmin(task.projectId, userId);
    return;
  } catch {
    throw new ForbiddenError("You don't have permission to modify this task");
  }
}

/**
 * Check if user can delete a task.
 * Task can be deleted by:
 * - Task creator
 * - Project admins
 */
export async function assertTaskDeleteAccess(
  taskId: number,
  userId: number,
): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, createdBy: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Task creator can delete
  if (task.createdBy === userId) return;

  // Project admins can delete
  try {
    await assertProjectAdmin(task.projectId, userId);
    return;
  } catch {
    throw new ForbiddenError(
      "Only task creators and project admins can delete tasks",
    );
  }
}

/**
 * Check if user can access a comment through task/project membership.
 */
export async function assertCommentAccess(
  commentId: number,
  userId: number,
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { taskId: true },
  });

  if (!comment) {
    throw new NotFoundError("Comment");
  }

  await assertTaskAccess(comment.taskId, userId);
}

/**
 * Check if user can modify a comment.
 * Only the comment author can modify their own comments.
 */
export async function assertCommentModifyAccess(
  commentId: number,
  userId: number,
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    throw new NotFoundError("Comment");
  }

  if (comment.authorId !== userId) {
    throw new ForbiddenError("You can only edit your own comments");
  }
}

/**
 * Check if user can delete a comment.
 * Comment can be deleted by:
 * - Comment author
 * - Project admins
 */
export async function assertCommentDeleteAccess(
  commentId: number,
  userId: number,
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, taskId: true },
  });

  if (!comment) {
    throw new NotFoundError("Comment");
  }

  // Author can delete their own comments
  if (comment.authorId === userId) return;

  // Get project through task
  const task = await prisma.task.findUnique({
    where: { id: comment.taskId },
    select: { projectId: true },
  });

  if (!task) {
    throw new NotFoundError("Task");
  }

  // Project admins can delete
  try {
    await assertProjectAdmin(task.projectId, userId);
    return;
  } catch {
    throw new ForbiddenError(
      "Only comment authors and project admins can delete comments",
    );
  }
}
