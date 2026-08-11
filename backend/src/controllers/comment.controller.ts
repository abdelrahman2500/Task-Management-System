import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as commentService from "../services/comment.service";
import { sendSuccess, sendCreated, sendMessage } from "../lib/response";

export async function listComments(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.taskId);
    const comments = await commentService.listComments(
      taskId,
      req.user!.userId,
    );
    sendSuccess(res, comments);
  } catch (error) {
    next(error);
  }
}

export async function createComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Number(req.params.taskId);
    const comment = await commentService.createComment(
      taskId,
      req.body,
      req.user!.userId,
    );
    sendCreated(res, comment);
  } catch (error) {
    next(error);
  }
}

export async function updateComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.updateComment(
      commentId,
      req.body,
      req.user!.userId,
    );
    sendSuccess(res, comment);
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const commentId = Number(req.params.commentId);
    const result = await commentService.deleteComment(
      commentId,
      req.user!.userId,
    );
    sendMessage(res, result.message);
  } catch (error) {
    next(error);
  }
}
