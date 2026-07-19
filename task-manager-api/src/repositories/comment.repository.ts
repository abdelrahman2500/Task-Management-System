import prisma from "../config/prisma.js";

export class CommentRepository {
  async findAll() {
    return await prisma.comment.findMany({
      include: {
        task: true,
        author: true,
      },
    });
  }

  async findById(id: number) {
    return await prisma.comment.findUnique({
      where: { id },
      include: {
        task: true,
        author: true,
      },
    });
  }

  async findByTaskId(taskId: number) {
    return await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: true,
      },
    });
  }

  async create(data: { taskId: number; authorId: number; body: string }) {
    return await prisma.comment.create({
      data: {
        taskId: data.taskId,
        authorId: data.authorId,
        body: data.body,
      },
    });
  }

  async update(id: number, data: { body?: string }) {
    return await prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.comment.delete({
      where: { id },
    });
  }
}
