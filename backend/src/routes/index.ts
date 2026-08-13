import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { projectRoutes } from "./project.routes";
import { taskRoutes } from "./task.routes";
import { commentRoutes } from "./comment.routes";
import { userRoutes } from "./user.routes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/comments", commentRoutes);
router.use("/users", userRoutes);
