import type { Request, Response } from "express";
import { CommentService } from "../services/comment.service.js";
import type { CreateCommentDto, UpdateCommentDto } from "../dto/comment.dto.js";

const service = new CommentService();

export class CommentController {
  async getAllComments(_: Request, res: Response) {
    try {
      const comments = await service.getAllComments();
      return res.json({ success: true, data: comments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCommentById(req: Request, res: Response) {
    try {
      const commentId = parseInt(req.params.commentId as string, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ success: false, error: "Invalid comment ID" });
      }
      const comment = await service.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ success: false, error: "Comment not found" });
      }
      return res.json({ success: true, data: comment });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCommentsByTaskId(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId as string, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ success: false, error: "Invalid task ID" });
      }
      const comments = await service.getCommentsByTaskId(taskId);
      return res.json({ success: true, data: comments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createComment(req: Request<{ taskId?: string }, {}, CreateCommentDto>, res: Response) {
    try {
      const paramTaskId = req.params.taskId ? parseInt(req.params.taskId, 10) : undefined;
      const taskId = paramTaskId ?? (req.body.taskId ? Number(req.body.taskId) : undefined);

      if (taskId === undefined || isNaN(taskId)) {
        return res.status(400).json({ success: false, error: "Valid taskId is required" });
      }

      const { authorId, body } = req.body;

      if (!body) {
        return res.status(400).json({ success: false, error: "Body is required" });
      }
      if (authorId === undefined || isNaN(Number(authorId))) {
        return res.status(400).json({ success: false, error: "Valid authorId is required" });
      }

      const comment = await service.createComment({
        taskId,
        authorId: Number(authorId),
        body,
      });

      return res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateComment(req: Request<{ commentId: string }, {}, UpdateCommentDto>, res: Response) {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ success: false, error: "Invalid comment ID" });
      }

      const { body } = req.body;
      if (!body) {
        return res.status(400).json({ success: false, error: "Body is required to update" });
      }

      const comment = await service.updateComment(commentId, { body });
      return res.json({ success: true, data: comment });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const commentId = parseInt(req.params.commentId as string, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ success: false, error: "Invalid comment ID" });
      }
      await service.deleteComment(commentId);
      return res.json({ success: true, message: "Comment deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
