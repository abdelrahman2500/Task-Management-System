import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { CommentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateTaskSchema } from "../schemas/task.schema.js";
import { createCommentSchema, updateCommentSchema } from "../schemas/comment.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const taskController = new TaskController();
const commentController = new CommentController();

// Base task endpoints
router.get("/", authMiddleware, asyncHandler(taskController.getAllTasks));
router.get("/:taskId", authMiddleware, asyncHandler(taskController.getTaskById));
router.patch(
  "/:taskId",
  authMiddleware,
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);
router.delete("/:taskId", authMiddleware, asyncHandler(taskController.deleteTask));

// Nested comments endpoints
router.get(
  "/:taskId/comments",
  authMiddleware,
  asyncHandler(commentController.getCommentsByTaskId),
);
router.post(
  "/:taskId/comments",
  authMiddleware,
  validate(createCommentSchema),
  asyncHandler(commentController.createComment),
);
router.patch(
  "/:taskId/comments/:commentId",
  authMiddleware,
  validate(updateCommentSchema),
  asyncHandler(commentController.updateComment),
);
router.delete(
  "/:taskId/comments/:commentId",
  authMiddleware,
  asyncHandler(commentController.deleteComment),
);

export default router;
