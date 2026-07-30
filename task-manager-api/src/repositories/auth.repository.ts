import prisma from "../config/prisma.js";

export class AuthRepository {
  async register(data: { name: string; email: string; password: string }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password,
      },
    });
  }
  login() {}
  logout() {}
  me() {}
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async findById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
