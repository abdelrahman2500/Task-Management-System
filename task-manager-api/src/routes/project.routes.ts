import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from "../schemas/project.schema.js";

const router = Router();
const controller = new ProjectController();

router.get(
  "/",
  authMiddleware,
  validate(listProjectsQuerySchema, "query"),
  controller.listProjects,
);

router.post(
  "/",
  authMiddleware,
  validate(createProjectSchema, "body"),
  controller.createProject,
);

router.get(
  "/:projectId",
  authMiddleware,
  controller.getProjectById,
);

router.patch(
  "/:projectId",
  authMiddleware,
  validate(updateProjectSchema, "body"),
  controller.updateProject,
);

router.delete(
  "/:projectId",
  authMiddleware,
  controller.deleteProject,
);

export default router;
