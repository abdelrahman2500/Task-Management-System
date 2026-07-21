import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectStatus } from "@prisma/client";
import { AppError } from "../utils/errors/app-error.js";
import type { CreateProjectDto, UpdateProjectDto } from "../dto/project.dto.js";

export class ProjectService {
  constructor(private repository = new ProjectRepository()) {}

  async getAllProjects() {
    return this.repository.findAll();
  }

  async getProjectById(id: number) {
    const project = await this.repository.findById(id);

    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    return project;
  }

  async createProject(data: CreateProjectDto) {
    return this.repository.create({
      ...data,
      status: data.status ?? ProjectStatus.ACTIVE,
    });
  }

  async updateProject(id: number, data: UpdateProjectDto) {
    await this.getProjectById(id);
    return this.repository.update(id, data);
  }

  async deleteProject(id: number) {
    await this.getProjectById(id);
    return this.repository.delete(id);
  }
}
