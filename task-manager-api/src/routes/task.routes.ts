import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} from "../schemas/task.schema.js";

const router = Router();
const taskController = new TaskController();

router.get(
  "/",
  authMiddleware,
  validate(listTasksQuerySchema, "query"),
  taskController.listTasks,
);

router.post(
  "/",
  authMiddleware,
  validate(createTaskSchema, "body"),
  taskController.createTask,
);

router.get(
  "/:taskId",
  authMiddleware,
  taskController.getTaskById,
);

router.patch(
  "/:taskId",
  authMiddleware,
  validate(updateTaskSchema, "body"),
  taskController.updateTask,
);

router.delete(
  "/:taskId",
  authMiddleware,
  taskController.deleteTask,
);

export default router;
