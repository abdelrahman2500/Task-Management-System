import { Router } from "express";
import { CommentController } from "../controllers/comment.controller.js";

const router = Router();
const controller = new CommentController();

router.get("/", controller.getAllComments);
router.get("/:commentId", controller.getCommentById);
router.patch("/:commentId", controller.updateComment);
router.delete("/:commentId", controller.deleteComment);

export default router;
