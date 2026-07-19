import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectStatus } from "@prisma/client";

export class ProjectService {
  constructor(private repository = new ProjectRepository()) {}

  async getAllProjects() {
    return await this.repository.findAll();
  }

  async getProjectById(id: number) {
    return await this.repository.findById(id);
  }

  async createProject(data: {
    ownerId: number;
    name: string;
    description?: string | null;
    status?: ProjectStatus;
  }) {
    return await this.repository.create({
      ...data,
      status: data.status ?? ProjectStatus.ACTIVE,
    });
  }

  async updateProject(
    id: number,
    data: {
      ownerId?: number;
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
    }
  ) {
    return await this.repository.update(id, data);
  }

  async deleteProject(id: number) {
    return await this.repository.delete(id);
  }
}