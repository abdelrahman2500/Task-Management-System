import type { Request, Response } from "express";
import { CommentService } from "../services/comment.service.js";
import type { CreateCommentDto, UpdateCommentDto } from "../dto/comment.dto.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/errors/app-error.js";
import { parseRequiredId } from "../utils/parse-required-id.js";

const service = new CommentService();

export class CommentController {
  getAllComments = asyncHandler(async (_: Request, res: Response) => {
    const comments = await service.getAllComments();
    return res.json({ success: true, data: comments });
  });

  getCommentById = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseRequiredId(
      req.params.commentId,
      "INVALID_COMMENT_ID",
      "Invalid comment ID",
    );
    const comment = await service.getCommentById(commentId);
    if (!comment) {
      throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found");
    }
    return res.json({ success: true, data: comment });
  });

  getCommentsByTaskId = asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseRequiredId(
      req.params.taskId,
      "INVALID_TASK_ID",
      "Invalid task ID",
    );
    const comments = await service.getCommentsByTaskId(taskId);
    return res.json({ success: true, data: comments });
  });

  createComment = asyncHandler(
    async (req: Request<{ taskId?: string }, {}, CreateCommentDto>, res: Response) => {
      const paramTaskId = req.params.taskId ? parseInt(req.params.taskId, 10) : undefined;
      const taskId = paramTaskId ?? (req.body.taskId ? Number(req.body.taskId) : undefined);

      if (taskId === undefined || isNaN(taskId)) {
        throw new AppError(400, "INVALID_TASK_ID", "Valid taskId is required");
      }

      const { authorId, body } = req.body;

      if (!body) {
        throw new AppError(400, "MISSING_BODY", "Body is required");
      }
      if (authorId === undefined || isNaN(Number(authorId))) {
        throw new AppError(400, "INVALID_AUTHOR_ID", "Valid authorId is required");
      }

      const comment = await service.createComment({
        taskId,
        authorId: Number(authorId),
        body,
      });

      return res.status(201).json({ success: true, data: comment });
    },
  );

  updateComment = asyncHandler(
    async (req: Request<{ commentId: string }, {}, UpdateCommentDto>, res: Response) => {
      const commentId = parseRequiredId(
        req.params.commentId,
        "INVALID_COMMENT_ID",
        "Invalid comment ID",
      );

      const { body } = req.body;
      if (!body) {
        throw new AppError(400, "MISSING_BODY", "Body is required to update");
      }

      const comment = await service.updateComment(commentId, { body });
      return res.json({ success: true, data: comment });
    },
  );

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseRequiredId(
      req.params.commentId,
      "INVALID_COMMENT_ID",
      "Invalid comment ID",
    );
    await service.deleteComment(commentId);
    return res.json({ success: true, message: "Comment deleted successfully" });
  });
}
