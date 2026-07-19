import prisma from "../config/prisma.js";

export class AuthRepository {
  register() {}
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
  async findById(id: number){
    return prisma.user.findUnique({
      where:{
        id
      }
    })
  }
}