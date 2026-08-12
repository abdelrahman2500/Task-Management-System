import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { writeLimiter, readLimiter } from "../middleware/rateLimiter";
import * as taskController from "../controllers/task.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  projectIdParamSchema,
  taskIdParamSchema,
} from "../schemas/task.schemas";

export const taskRoutes = Router();

// All task routes require authentication
taskRoutes.use(authenticate);

// Tasks
taskRoutes.get(
  "/project/:projectId",
  readLimiter,
  validateParams(projectIdParamSchema),
  validateQuery(listTasksQuerySchema),
  taskController.listTasks,
);
taskRoutes.get(
  "/:taskId",
  readLimiter,
  validateParams(taskIdParamSchema),
  taskController.getTask,
);
taskRoutes.post(
  "/project/:projectId",
  writeLimiter,
  validateParams(projectIdParamSchema),
  validate(createTaskSchema),
  taskController.createTask,
);
taskRoutes.put(
  "/:taskId",
  writeLimiter,
  validateParams(taskIdParamSchema),
  validate(updateTaskSchema),
  taskController.updateTask,
);
taskRoutes.delete(
  "/:taskId",
  writeLimiter,
  validateParams(taskIdParamSchema),
  taskController.deleteTask,
);
