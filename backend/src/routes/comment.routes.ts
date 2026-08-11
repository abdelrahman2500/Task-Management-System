import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as commentController from "../controllers/comment.controller";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../schemas/comment.schemas";

export const commentRoutes = Router();

// All comment routes require authentication
commentRoutes.use(authenticate);

// Comments
commentRoutes.get("/task/:taskId", commentController.listComments);
commentRoutes.post(
  "/task/:taskId",
  validate(createCommentSchema),
  commentController.createComment,
);
commentRoutes.put(
  "/:commentId",
  validate(updateCommentSchema),
  commentController.updateComment,
);
commentRoutes.delete("/:commentId", commentController.deleteComment);
