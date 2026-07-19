import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { TaskController } from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createProjectSchema } from "../schemas/project.schema.js";

const router = Router();
const controller = new ProjectController();
const taskController = new TaskController();

router.get(
  "/",
  authMiddleware,
  authorize(["owner", "admin", "member", "viewer"]),
  controller.getAllProjects,
);
router.post(
  "/",
  validate(createProjectSchema),
  // authMiddleware,
  // authorize(["owner"]),
  controller.createProject,
);
router.get(
  "/:projectId",
  authMiddleware,
  authorize(["member", "owner"]),
  controller.getProjectById,
);
router.patch(
  "/:projectId",
  authMiddleware,
  authorize(["owner"]),
  controller.updateProject,
);
router.delete(
  "/:projectId",
  authMiddleware,
  authorize(["owner"]),
  controller.deleteProject,
);

// Nested tasks under a project
router.get(
  "/:projectId/tasks",
  authMiddleware,
  authorize(["member", "owner"]),
  taskController.getTasksByProjectId,
);
router.post(
  "/:projectId/tasks",
  authMiddleware,
  authorize(["owner"]),
  taskController.createTask,
);

export default router;
