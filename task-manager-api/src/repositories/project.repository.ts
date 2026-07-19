import prisma from "../config/prisma.js";
import { ProjectStatus } from "@prisma/client";

export class ProjectRepository {
  async findAll() {
    return await prisma.project.findMany({
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findById(id: number) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
    });
  }

  async create(data: {
    ownerId: number;
    name: string;
    description?: string | null;
    status: ProjectStatus;
  }) {
    return await prisma.project.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        description: data.description ?? undefined,
        status: data.status,
      },
    });
  }

  async update(
    id: number,
    data: {
      ownerId?: number;
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
    },
  ) {
    return await prisma.project.update({
      where: { id },
      data: {
        ownerId: data.ownerId,
        name: data.name,
        description:
          data.description === null ? null : (data.description ?? undefined),
        status: data.status,
      },
    });
  }

  async delete(id: number) {
    return await prisma.project.delete({
      where: { id },
    });
  }

  async getProjectMember(projectId: number, userId: number) {
    return await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }
}
