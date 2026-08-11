import type { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { parseRequiredId } from "../utils/parse-required-id.js";
import { AppError } from "../utils/errors/app-error.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from "../schemas/task.schema.js";

const service = new TaskService();

export class TaskController {
  listTasks = asyncHandler(
    async (req: Request<{}, {}, {}, ListTasksQuery>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const result = await service.listTasks(req.user, req.query);
      return res.json({ success: true, data: result });
    },
  );

  getTaskById = asyncHandler(
    async (req: Request<{ taskId: string }>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const taskId = parseRequiredId(
        req.params.taskId,
        "INVALID_TASK_ID",
        "Invalid task ID",
      );

      const task = await service.getTaskById(req.user, taskId);
      return res.json({ success: true, data: task });
    },
  );

  createTask = asyncHandler(
    async (req: Request<{}, {}, CreateTaskInput>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const task = await service.createTask(req.user, req.body);
      return res.status(201).json({ success: true, data: task });
    },
  );

  updateTask = asyncHandler(
    async (
      req: Request<{ taskId: string }, {}, UpdateTaskInput>,
      res: Response,
    ) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const taskId = parseRequiredId(
        req.params.taskId,
        "INVALID_TASK_ID",
        "Invalid task ID",
      );

      const task = await service.updateTask(req.user, taskId, req.body);
      return res.json({ success: true, data: task });
    },
  );

  deleteTask = asyncHandler(
    async (req: Request<{ taskId: string }>, res: Response) => {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
      }

      const taskId = parseRequiredId(
        req.params.taskId,
        "INVALID_TASK_ID",
        "Invalid task ID",
      );

      await service.deleteTask(req.user, taskId);
      return res.json({
        success: true,
        message: "Task deleted successfully",
      });
    },
  );
}
