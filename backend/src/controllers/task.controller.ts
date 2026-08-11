import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as taskService from "../services/task.service";
import { sendSuccess, sendCreated, sendMessage } from "../lib/response";

export async function listTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const tasks = await taskService.listTasks(projectId, req.user!.userId);
    sendSuccess(res, tasks);
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
