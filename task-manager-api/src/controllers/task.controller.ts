import type { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";
import type { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/errors/app-error.js";
import { parseRequiredId } from "../utils/parse-required-id.js";

const service = new TaskService();

export class TaskController {
  getAllTasks = asyncHandler(async (_: Request, res: Response) => {
    const tasks = await service.getAllTasks();
    return res.json({ success: true, data: tasks });
  });

  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseRequiredId(
      req.params.taskId,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
    const task = await service.getTaskById(taskId);
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    return res.json({ success: true, data: task });
  });

  getTasksByProjectId = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseRequiredId(
      req.params.projectId,
      "INVALID_PROJECT_ID",
      "Invalid project ID",
    );
    const tasks = await service.getTasksByProjectId(projectId);
    return res.json({ success: true, data: tasks });
  });

  createTask = asyncHandler(
    async (req: Request<{ projectId?: string }, {}, CreateTaskDto>, res: Response) => {
      const paramProjectId = req.params.projectId ? parseInt(req.params.projectId, 10) : undefined;
      const projectId = paramProjectId ?? (req.body.projectId ? Number(req.body.projectId) : undefined);

      if (projectId === undefined || isNaN(projectId)) {
        throw new AppError(400, "INVALID_PROJECT_ID", "Valid projectId is required");
      }

      const { title, assigneeId, createdBy, description, status, priority, dueDate } = req.body;

      if (!title) {
        throw new AppError(400, "MISSING_TITLE", "Title is required");
      }
      if (createdBy === undefined || isNaN(Number(createdBy))) {
        throw new AppError(400, "INVALID_CREATED_BY", "Valid createdBy user ID is required");
      }

      const task = await service.createTask({
        projectId,
        assigneeId: assigneeId !== undefined ? Number(assigneeId) : null,
        createdBy: Number(createdBy),
        title,
        description,
        status: status ?? "TODO",
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      return res.status(201).json({ success: true, data: task });
    },
  );

  updateTask = asyncHandler(
    async (req: Request<{ taskId: string }, {}, UpdateTaskDto>, res: Response) => {
      const taskId = parseRequiredId(
        req.params.taskId,
        "INVALID_TASK_ID",
        "Invalid task ID",
      );

      const { projectId, assigneeId, createdBy, title, description, status, priority, dueDate } = req.body;

      const task = await service.updateTask(taskId, {
        projectId: projectId !== undefined ? Number(projectId) : undefined,
        assigneeId: assigneeId === null ? null : (assigneeId !== undefined ? Number(assigneeId) : undefined),
        createdBy: createdBy !== undefined ? Number(createdBy) : undefined,
        title,
        description,
        status,
        priority,
        dueDate: dueDate === null ? null : (dueDate ? new Date(dueDate) : undefined),
      });

      return res.json({ success: true, data: task });
    },
  );

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseRequiredId(
      req.params.taskId,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
    await service.deleteTask(taskId);
    return res.json({ success: true, message: "Task deleted successfully" });
  });
}
