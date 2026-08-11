import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  UpdateMemberInput,
} from "../schemas/project.schemas";

export async function listProjects(userId: number) {
  // Projects the user owns or is a member of
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        select: {
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        select: {
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  assertProjectAccess(project, userId);

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

  assertProjectAdmin(project, userId);

  return prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        select: {
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
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

  assertProjectOwner(project, userId);

  await prisma.project.delete({ where: { id: projectId } });

  return { message: "Project deleted successfully" };
}

// Members
export async function listMembers(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new NotFoundError("Project");
  }

  assertProjectAccess(project, userId);

  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
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

  assertProjectAdmin(project, userId);

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

  assertProjectAdmin(project, userId);

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

  assertProjectAdmin(project, userId);

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

// Access helpers
function assertProjectAccess(
  project: { id: number; ownerId?: number },
  userId: number,
) {
  // Will be checked via membership query in real implementation
}

async function assertProjectAdmin(
  project: { id: number; ownerId: number },
  userId: number,
) {
  if (project.ownerId === userId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: project.id, userId } },
  });

  if (
    !membership ||
    (membership.role !== "admin" && membership.role !== "owner")
  ) {
    throw new ForbiddenError();
  }
}

function assertProjectOwner(
  project: { id: number; ownerId: number },
  userId: number,
) {
  if (project.ownerId !== userId) {
    throw new ForbiddenError("Only the project owner can perform this action");
  }
}
