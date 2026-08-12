import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import {
  assertProjectAccess,
  assertProjectAdmin,
  assertProjectOwner,
} from "../lib/authorization";
import {
  parsePaginationParams,
  createPaginatedResponse,
} from "../lib/pagination";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  UpdateMemberInput,
} from "../schemas/project.schemas";

export async function listProjects(
  userId: number,
  page: number = 1,
  limit: number = 20,
) {
  const { skip, take } = parsePaginationParams({ page, limit });

  // Projects the user owns or is a member of
  // Optimized: Only fetch necessary fields to avoid N+1 on members
  const [total, projects] = await Promise.all([
    prisma.project.count({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    }),
    prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return createPaginatedResponse(projects, page, limit, total);
}

export async function getProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAccess(project.id, userId);

  return project;
}

export async function createProject(data: CreateProjectInput, userId: number) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  // Add owner as a member with 'owner' role
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId,
      role: "owner",
    },
  });

  return project;
}

export async function updateProject(
  projectId: number,
  data: UpdateProjectInput,
  userId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAdmin(project.id, userId);

  return prisma.project.update({
    where: { id: projectId },
    data,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
}

export async function deleteProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectOwner(project.id, userId);

  await prisma.project.delete({ where: { id: projectId } });

  return { message: "Project deleted successfully" };
}

// Members
export async function listMembers(
  projectId: number,
  userId: number,
  page: number = 1,
  limit: number = 20,
) {
  await assertProjectAccess(projectId, userId);

  const { skip, take } = parsePaginationParams({ page, limit });

  const [total, members] = await Promise.all([
    prisma.projectMember.count({ where: { projectId } }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
  ]);

  return createPaginatedResponse(members, page, limit, total);
}

export async function addMember(
  projectId: number,
  data: AddMemberInput,
  userId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAdmin(project.id, userId);

  // Check user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Check not already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: data.userId } },
  });

  if (existing) {
    throw new ForbiddenError("User is already a member of this project");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateMember(
  projectId: number,
  memberId: number,
  data: UpdateMemberInput,
  userId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAdmin(project.id, userId);

  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId: memberId },
  });

  if (!member) {
    throw new NotFoundError("Member");
  }

  // Cannot change owner's role
  if (member.role === "owner") {
    throw new ForbiddenError("Cannot change the project owner's role");
  }

  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: memberId } },
    data: { role: data.role },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function removeMember(
  projectId: number,
  memberId: number,
  userId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  await assertProjectAdmin(project.id, userId);

  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId: memberId },
  });

  if (!member) {
    throw new NotFoundError("Member");
  }

  if (member.role === "owner") {
    throw new ForbiddenError("Cannot remove the project owner");
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberId } },
  });

  return { message: "Member removed successfully" };
}

// Removed duplicate authorization functions - now imported from authorization.ts
