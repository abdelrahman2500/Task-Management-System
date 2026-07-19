import prisma from "../config/prisma.js";
import { TaskStatus, TaskPriority } from "@prisma/client";

export class TaskRepository {
  async findAll() {
    return await prisma.task.findMany({
      include: {
        project: true,
        assignee: true,
        creator: true,
      },
    });
  }

  async findById(id: number) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        creator: true,
        comments: true,
      },
    });
  }

  async findByProjectId(projectId: number) {
    return await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        creator: true,
      },
    });
  }

  async create(data: {
    projectId: number;
    assigneeId?: number | null;
    createdBy: number;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
  }) {
    return await prisma.task.create({
      data: {
        projectId: data.projectId,
        assigneeId: data.assigneeId ?? undefined,
        createdBy: data.createdBy,
        title: data.title,
        description: data.description ?? undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ?? undefined,
      },
    });
  }

  async update(
    id: number,
    data: {
      projectId?: number;
      assigneeId?: number | null;
      createdBy?: number;
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date | null;
    }
  ) {
    return await prisma.task.update({
      where: { id },
      data: {
        projectId: data.projectId,
        assigneeId: data.assigneeId === null ? null : (data.assigneeId ?? undefined),
        createdBy: data.createdBy,
        title: data.title,
        description: data.description === null ? null : (data.description ?? undefined),
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate === null ? null : (data.dueDate ?? undefined),
      },
    });
  }

  async delete(id: number) {
    return await prisma.task.delete({
      where: { id },
    });
  }
}
