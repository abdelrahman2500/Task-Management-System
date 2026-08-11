import type { Request, Response } from "express";
import { ProjectService } from "../services/project.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { parseRequiredId } from "../utils/parse-required-id.js";
import { AppError } from "../utils/errors/app-error.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from "../schemas/project.schema.js";

const service = new ProjectService();

export class ProjectController {
  listProjects = asyncHandler(
    async (
      req: Request<{}, {}, {}, ListProjectsQuery>,
      res: Response,
    ) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const result = await service.listProjects(req.user, req.query);
      return res.json({ success: true, data: result });
    },
  );

  getProjectById = asyncHandler(
    async (req: Request<{ projectId: string }>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const projectId = parseRequiredId(
        req.params.projectId,
        "INVALID_PROJECT_ID",
        "Invalid project ID",
      );

      const project = await service.getProjectById(req.user, projectId);
      return res.json({ success: true, data: project });
    },
  );

  createProject = asyncHandler(
    async (req: Request<{}, {}, CreateProjectInput>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const project = await service.createProject(req.user, req.body);
      return res.status(201).json({ success: true, data: project });
    },
  );

  updateProject = asyncHandler(
    async (
      req: Request<{ projectId: string }, {}, UpdateProjectInput>,
      res: Response,
    ) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const projectId = parseRequiredId(
        req.params.projectId,
        "INVALID_PROJECT_ID",
        "Invalid project ID",
      );

      const project = await service.updateProject(req.user, projectId, req.body);
      return res.json({ success: true, data: project });
    },
  );

  deleteProject = asyncHandler(
    async (req: Request<{ projectId: string }>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const projectId = parseRequiredId(
        req.params.projectId,
        "INVALID_PROJECT_ID",
        "Invalid project ID",
      );

      await service.deleteProject(req.user, projectId);
      return res.json({
        success: true,
        message: "Project deleted successfully",
      });
    },
  );
}
