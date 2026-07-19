import type { Request, Response } from "express";
import { ProjectService } from "../services/project.service.js";
import type { CreateProjectDto, UpdateProjectDto } from "../dto/project.dto.js";

const service = new ProjectService();

export class ProjectController {
  async getAllProjects(_: Request, res: Response) {
    try {
      const projects = await service.getAllProjects();
      return res.json({ success: true, data: projects });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId as string, 10);
      if (isNaN(projectId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid project ID" });
      }
      const project = await service.getProjectById(projectId);
      if (!project) {
        return res
          .status(404)
          .json({ success: false, error: "Project not found" });
      }
      return res.json({ success: true, data: project });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createProject(req: Request<{}, {}, CreateProjectDto>, res: Response) {
    try {
      const { ownerId, name, description, status } = req.body;

      const project = await service.createProject({
        ownerId: Number(ownerId),
        name,
        description,
        status,
      });

      return res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateProject(
    req: Request<{ projectId: string }, {}, UpdateProjectDto>,
    res: Response,
  ) {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      if (isNaN(projectId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid project ID" });
      }

      const { ownerId, name, description, status } = req.body;

      const project = await service.updateProject(projectId, {
        ownerId: ownerId !== undefined ? Number(ownerId) : undefined,
        name,
        description,
        status,
      });

      return res.json({ success: true, data: project });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId as string, 10);
      if (isNaN(projectId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid project ID" });
      }
      await service.deleteProject(projectId);
      return res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
