import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as projectController from "../controllers/project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberSchema,
} from "../schemas/project.schemas";

export const projectRoutes = Router();

// All project routes require authentication
projectRoutes.use(authenticate);

// Projects
projectRoutes.get("/", projectController.listProjects);
projectRoutes.get("/:projectId", projectController.getProject);
projectRoutes.post(
  "/",
  validate(createProjectSchema),
  projectController.createProject,
);
projectRoutes.put(
  "/:projectId",
  validate(updateProjectSchema),
  projectController.updateProject,
);
projectRoutes.delete("/:projectId", projectController.deleteProject);

// Project Members
projectRoutes.get("/:projectId/members", projectController.listMembers);
projectRoutes.post(
  "/:projectId/members",
  validate(addMemberSchema),
  projectController.addMember,
);
projectRoutes.put(
  "/:projectId/members/:memberId",
  validate(updateMemberSchema),
  projectController.updateMember,
);
projectRoutes.delete(
  "/:projectId/members/:memberId",
  projectController.removeMember,
);
