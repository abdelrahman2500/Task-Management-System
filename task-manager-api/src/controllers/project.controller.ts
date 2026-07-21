import type { Request, Response } from "express";
import { ProjectService } from "../services/project.service.js";
import type { CreateProjectDto, UpdateProjectDto } from "../dto/project.dto.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/errors/app-error.js";
import { parseRequiredId } from "../utils/parse-required-id.js";

const service = new ProjectService();

export class ProjectController {
  getAllProjects = asyncHandler(async (_: Request, res: Response) => {
    const projects = await service.getAllProjects();
    return res.json({ success: true, data: projects });
  });
  getProjectById = asyncHandler(
    async (req: Request<{ projectId: string }>, res: Response) => {
      const project = await service.getProjectById(
        Number(req.params.projectId),
      );

      res.json({
        success: true,
        data: project,
      });
    },
  );

  createProject = asyncHandler(
    async (req: Request<{}, {}, CreateProjectDto>, res: Response) => {
      const { ownerId, name, description, status } = req.body;

      const project = await service.createProject({
        ownerId: Number(ownerId),
        name,
        description,
        status,
      });

      return res.status(201).json({ success: true, data: project });
    },
  );

  updateProject = asyncHandler(
    async (
      req: Request<{ projectId: string }, {}, UpdateProjectDto>,
      res: Response,
    ) => {
      const projectId = parseRequiredId(
        req.params.projectId,
        "INVALID_PROJECT_ID",
        "Invalid project ID",
      );

      const { ownerId, name, description, status } = req.body;

      const project = await service.updateProject(projectId, {
        ownerId: ownerId !== undefined ? Number(ownerId) : undefined,
        name,
        description,
        status,
      });

      return res.json({ success: true, data: project });
    },
  );

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseRequiredId(
      req.params.projectId,
      "INVALID_PROJECT_ID",
      "Invalid project ID",
    );
    await service.deleteProject(projectId);
    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  });
}
