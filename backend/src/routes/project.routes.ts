import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { writeLimiter, readLimiter } from "../middleware/rateLimiter";
import * as projectController from "../controllers/project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberSchema,
  listQuerySchema,
  projectIdParamSchema,
  projectIdMemberIdParamSchema,
} from "../schemas/project.schemas";

export const projectRoutes = Router();

// All project routes require authentication
projectRoutes.use(authenticate);

// Projects
projectRoutes.get(
  "/",
  readLimiter,
  validateQuery(listQuerySchema),
  projectController.listProjects,
);
projectRoutes.get(
  "/:projectId",
  readLimiter,
  validateParams(projectIdParamSchema),
  projectController.getProject,
);
projectRoutes.post(
  "/",
  writeLimiter,
  validate(createProjectSchema),
  projectController.createProject,
);
projectRoutes.put(
  "/:projectId",
  writeLimiter,
  validateParams(projectIdParamSchema),
  validate(updateProjectSchema),
  projectController.updateProject,
);
projectRoutes.delete(
  "/:projectId",
  writeLimiter,
  validateParams(projectIdParamSchema),
  projectController.deleteProject,
);

// Project Members
projectRoutes.get(
  "/:projectId/members",
  readLimiter,
  validateParams(projectIdParamSchema),
  validateQuery(listQuerySchema),
  projectController.listMembers,
);
projectRoutes.post(
  "/:projectId/members",
  writeLimiter,
  validateParams(projectIdParamSchema),
  validate(addMemberSchema),
  projectController.addMember,
);
projectRoutes.put(
  "/:projectId/members/:memberId",
  writeLimiter,
  validateParams(projectIdMemberIdParamSchema),
  validate(updateMemberSchema),
  projectController.updateMember,
);
projectRoutes.delete(
  "/:projectId/members/:memberId",
  writeLimiter,
  validateParams(projectIdMemberIdParamSchema),
  projectController.removeMember,
);
