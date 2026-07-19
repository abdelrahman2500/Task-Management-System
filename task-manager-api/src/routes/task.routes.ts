import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { CommentController } from "../controllers/comment.controller.js";

const router = Router();
const taskController = new TaskController();
const commentController = new CommentController();

// Base task endpoints
router.get("/", taskController.getAllTasks);
router.get("/:taskId", taskController.getTaskById);
router.patch("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);

// Nested comments endpoints
router.get("/:taskId/comments", commentController.getCommentsByTaskId);
router.post("/:taskId/comments", commentController.createComment);

export default router;
