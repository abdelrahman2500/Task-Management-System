import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as taskController from "../controllers/task.controller";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schemas";

export const taskRoutes = Router();

// All task routes require authentication
taskRoutes.use(authenticate);

// Tasks
taskRoutes.get("/project/:projectId", taskController.listTasks);
taskRoutes.get("/:taskId", taskController.getTask);
taskRoutes.post(
  "/project/:projectId",
  validate(createTaskSchema),
  taskController.createTask,
);
taskRoutes.put(
  "/:taskId",
  validate(updateTaskSchema),
  taskController.updateTask,
);
taskRoutes.delete("/:taskId", taskController.deleteTask);
