import type { NextFunction, Request, Response } from "express";
import { ProjectRepository } from "../repositories/project.repository.js";
import { AppError } from "../utils/errors/app-error.js";

const repository = new ProjectRepository();

/**
 * Express middleware that enforces project-level role authorization.
 *
 * Usage:
 *   router.patch("/:projectId/...", authMiddleware, authorize(["OWNER", "ADMIN"]), handler)
 *
 * The middleware reads `req.params.projectId` and `req.user.id`, then looks up
 * the membership record. If the user is the project owner their effective role
 * is OWNER regardless of the members table.
 */
export function authorize(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = Number(req.params.projectId);
    const user = req.user;

    if (!user) {
      return next(
        new AppError(401, "UNAUTHORIZED", "Authentication is required."),
      );
    }

    if (isNaN(projectId)) {
      return next(
        new AppError(400, "INVALID_PROJECT_ID", "Invalid project ID."),
      );
    }

    // Use getMember (the correct method on ProjectRepository)
    const membership = await repository.getMember(projectId, user.id);

    if (!membership) {
      // The project service handles the owner-is-always-authorized case,
      // but here we also check if the user is the project owner directly.
      // Retrieve project to check ownerId.
      const project = await repository.findByIdWithDetails(projectId);
      if (!project) {
        return next(
          new AppError(404, "PROJECT_NOT_FOUND", "Project not found."),
        );
      }
      if (project.ownerId !== user.id) {
        return next(
          new AppError(
            403,
            "FORBIDDEN",
            "You do not have permission to perform this action.",
          ),
        );
      }
      // Owner always passes
      return next();
    }

    if (!roles.includes(membership.role)) {
      return next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action.",
        ),
      );
    }

    return next();
  };
}
