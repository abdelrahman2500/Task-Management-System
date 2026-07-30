import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(requestIdMiddleware);

app.use(httpLogger);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Task Manager API",
  });
});

app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
