import type { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";
import type { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto.js";

const service = new TaskService();

export class TaskController {
  async getAllTasks(_: Request, res: Response) {
    try {
      const tasks = await service.getAllTasks();
      return res.json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId as string, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ success: false, error: "Invalid task ID" });
      }
      const task = await service.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }
      return res.json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTasksByProjectId(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId as string, 10);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Invalid project ID" });
      }
      const tasks = await service.getTasksByProjectId(projectId);
      return res.json({ success: true, data: tasks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTask(req: Request<{ projectId?: string }, {}, CreateTaskDto>, res: Response) {
    try {
      const paramProjectId = req.params.projectId ? parseInt(req.params.projectId, 10) : undefined;
      const projectId = paramProjectId ?? (req.body.projectId ? Number(req.body.projectId) : undefined);

      if (projectId === undefined || isNaN(projectId)) {
        return res.status(400).json({ success: false, error: "Valid projectId is required" });
      }

      const { title, assigneeId, createdBy, description, status, priority, dueDate } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, error: "Title is required" });
      }
      if (createdBy === undefined || isNaN(Number(createdBy))) {
        return res.status(400).json({ success: false, error: "Valid createdBy user ID is required" });
      }

      const task = await service.createTask({
        projectId,
        assigneeId: assigneeId !== undefined ? Number(assigneeId) : null,
        createdBy: Number(createdBy),
        title,
        description,
        status: status ?? "TODO",
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      return res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateTask(req: Request<{ taskId: string }, {}, UpdateTaskDto>, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ success: false, error: "Invalid task ID" });
      }

      const { projectId, assigneeId, createdBy, title, description, status, priority, dueDate } = req.body;

      const task = await service.updateTask(taskId, {
        projectId: projectId !== undefined ? Number(projectId) : undefined,
        assigneeId: assigneeId === null ? null : (assigneeId !== undefined ? Number(assigneeId) : undefined),
        createdBy: createdBy !== undefined ? Number(createdBy) : undefined,
        title,
        description,
        status,
        priority,
        dueDate: dueDate === null ? null : (dueDate ? new Date(dueDate) : undefined),
      });

      return res.json({ success: true, data: task });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId as string, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ success: false, error: "Invalid task ID" });
      }
      await service.deleteTask(taskId);
      return res.json({ success: true, message: "Task deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
