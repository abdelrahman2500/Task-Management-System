import prisma from "../config/prisma.js";

export class UserRepository {
  async findAll() {
    return await prisma.user.findMany({
      include: {
        ownedProjects: true,
        assignedTasks: true,
      },
    });
  }

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        ownedProjects: true,
        assignedTasks: true,
        comments: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
  }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        isActive: data.isActive ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}