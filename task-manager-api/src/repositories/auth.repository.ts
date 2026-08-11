import prisma from "../config/prisma.js";
import type { Prisma, User } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

type UserWithPassword = User;

export class AuthRepository {
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<SafeUser> {
    return await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
      },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const normalized = email.trim().toLowerCase();
    return prisma.user.findUnique({
      where: {
        email: normalized,
      },
    });
  }

  async findSafeById(id: number): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: safeUserSelect,
    });
  }
}
