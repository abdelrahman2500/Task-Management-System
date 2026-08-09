import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { TaskController } from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const controller = new ProjectController();
const taskController = new TaskController();

router.get(
  "/",
  // authMiddleware,
  // authorize(["owner", "admin", "member", "viewer"]),
  controller.getAllProjects,
);
router.post(
  "/",
  authMiddleware,
  // authorize(["owner"]),
  // validate(createProjectSchema),
  controller.createProject,
);
router.get(
  "/:projectId",
  authMiddleware,
  authorize(["owner", "admin", "member", "viewer"]),
  asyncHandler(controller.getProjectById),
);
router.patch(
  "/:projectId",
  // authMiddleware,
  // authorize(["owner", "admin"]),
  validate(updateProjectSchema),
  controller.updateProject,
);
router.delete(
  "/:projectId",
  authMiddleware,
  // authorize(["owner"]),
  asyncHandler(controller.deleteProject),
);

// Nested tasks under a project
router.get(
  "/:projectId/tasks",
  authMiddleware,
  authorize(["owner", "admin", "member", "viewer"]),
  asyncHandler(taskController.getTasksByProjectId),
);
router.post(
  "/:projectId/tasks",
  authMiddleware,
  authorize(["owner", "admin", "member"]),
  validate(createTaskSchema),
  asyncHandler(taskController.createTask),
);
router.patch(
  "/:projectId/tasks/:taskId",
  authMiddleware,
  authorize(["owner", "admin", "member"]),
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);

export default router;
