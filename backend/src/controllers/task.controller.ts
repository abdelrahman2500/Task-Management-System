import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as taskService from "../services/task.service";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendPaginated,
} from "../lib/response";
import { parsePaginationParams } from "../lib/pagination";

export async function listTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const { page, limit } = parsePaginationParams({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });

    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      assigneeId: req.query.assigneeId
        ? Number(req.query.assigneeId)
        : undefined,
    };

    const result = await taskService.listTasks(
      projectId,
      req.user!.userId,
      page,
      limit,
      filters,
    );
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.taskId);
    const task = await taskService.getTask(taskId, req.user!.userId);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const task = await taskService.createTask(
      projectId,
      req.body,
      req.user!.userId,
    );
    sendCreated(res, task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.taskId);
    const task = await taskService.updateTask(
      taskId,
      req.body,
      req.user!.userId,
    );
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.taskId);
    const result = await taskService.deleteTask(taskId, req.user!.userId);
    sendMessage(res, result.message);
  } catch (error) {
    next(error);
  }
}
