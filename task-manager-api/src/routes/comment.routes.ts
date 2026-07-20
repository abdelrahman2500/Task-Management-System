import { Router } from "express";
import { CommentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateCommentSchema } from "../schemas/comment.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const controller = new CommentController();

router.get("/", authMiddleware, asyncHandler(controller.getAllComments));
router.get("/:commentId", authMiddleware, asyncHandler(controller.getCommentById));
router.patch(
  "/:commentId",
  authMiddleware,
  validate(updateCommentSchema),
  asyncHandler(controller.updateComment),
);
router.delete("/:commentId", authMiddleware, asyncHandler(controller.deleteComment));

export default router;
