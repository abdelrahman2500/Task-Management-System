import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { writeLimiter, readLimiter } from "../middleware/rateLimiter";
import * as commentController from "../controllers/comment.controller";
import {
  createCommentSchema,
  updateCommentSchema,
  listQuerySchema,
  taskIdParamSchema,
  commentIdParamSchema,
} from "../schemas/comment.schemas";

export const commentRoutes = Router();

// All comment routes require authentication
commentRoutes.use(authenticate);

// Comments
commentRoutes.get(
  "/task/:taskId",
  readLimiter,
  validateParams(taskIdParamSchema),
  validateQuery(listQuerySchema),
  commentController.listComments,
);
commentRoutes.post(
  "/task/:taskId",
  writeLimiter,
  validateParams(taskIdParamSchema),
  validate(createCommentSchema),
  commentController.createComment,
);
commentRoutes.put(
  "/:commentId",
  writeLimiter,
  validateParams(commentIdParamSchema),
  validate(updateCommentSchema),
  commentController.updateComment,
);
commentRoutes.delete(
  "/:commentId",
  writeLimiter,
  validateParams(commentIdParamSchema),
  commentController.deleteComment,
);
