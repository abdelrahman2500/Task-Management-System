import prisma from "../config/prisma.js";
import { safeUserSelect, type SafeUser } from "./auth.repository.js";
import { type Role } from "@prisma/client";
import type { User } from "@prisma/client";

interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UpdateSelfData {
  name?: string;
  email?: string;
}

interface UpdateByAdminData {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

interface CreateByAdminData {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
  isActive?: boolean;
}


export class UserRepository {
  async findAllPaginated({
    page,
    limit,
    search,
    role,
    isActive,
  }: ListUsersParams): Promise<PaginatedResult<SafeUser>> {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        select: safeUserSelect,
      }),
      prisma.user.count({ where }),
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

  async findSafeById(id: number): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return prisma.user.findUnique({
      where: { email: normalized },
    });
  }

  async updateSelf(id: number, data: UpdateSelfData): Promise<SafeUser> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase();
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: safeUserSelect,
    });
  }

  async updateByAdmin(id: number, data: UpdateByAdminData): Promise<SafeUser> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase();
    }
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: safeUserSelect,
    });
  }

  async createByAdmin(data: CreateByAdminData): Promise<SafeUser> {
    return prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        isActive: data.isActive,
      },
      select: safeUserSelect,
    });
  }

  async softDeleteOrDeactivate(id: number): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: safeUserSelect,
    });
  }

  async hardDelete(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { authorId: id },
      });

      await tx.task.deleteMany({
        where: { createdBy: id },
      });

      await tx.task.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null },
      });

      await tx.projectMember.deleteMany({
        where: { userId: id },
      });

      await tx.userPreferences.deleteMany({
        where: { userId: id },
      });

      const projectsToReassign = await tx.project.findMany({
        where: { ownerId: id },
        select: { id: true },
      });

      for (const project of projectsToReassign) {
        const memberCount = await tx.projectMember.count({
          where: { projectId: project.id },
        });

        if (memberCount > 0) {
          const newOwner = await tx.projectMember.findFirst({
            where: {
              projectId: project.id,
              role: { in: ["ADMIN", "MEMBER", "VIEWER"] },
            },
            orderBy: [{ role: "asc" }, { createdAt: "asc" }],
            select: { userId: true },
          });

          if (newOwner) {
            await tx.project.update({
              where: { id: project.id },
              data: { ownerId: newOwner.userId },
            });
            await tx.projectMember.upsert({
              where: {
                projectId_userId: {
                  projectId: project.id,
                  userId: newOwner.userId,
                },
              },
              create: {
                projectId: project.id,
                userId: newOwner.userId,
                role: "OWNER",
              },
              update: { role: "OWNER" },
            });
          } else {
            await tx.task.deleteMany({
              where: { projectId: project.id },
            });
            await tx.project.delete({
              where: { id: project.id },
            });
          }
        } else {
          await tx.task.deleteMany({
            where: { projectId: project.id },
          });
          await tx.project.delete({
            where: { id: project.id },
          });
        }
      }

      await tx.user.delete({
        where: { id },
      });
    });
  }
}
