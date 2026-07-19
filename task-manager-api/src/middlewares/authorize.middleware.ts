import type { NextFunction, Request, Response } from "express";
import { ProjectRepository } from "../repositories/project.repository.js";

const repository = new ProjectRepository();

export function authorize(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = Number(req.params.projectId);
    const userId = req.user?.id;

    const projectMember = await repository.getProjectMember(projectId, userId!);

    if (!projectMember) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
    const { role } = projectMember;

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    next();
  };
}
