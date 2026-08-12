import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.number().int().positive().nullable().optional(),
  projectId: z.number().int().positive(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .nullable()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  projectId: z.number().int().positive().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .nullable()
    .optional(),
});

/**
 * Query parameter validation schemas
 */
export const listTasksQuerySchema = z.object({
  page: z.string().pipe(z.coerce.number().int().min(1)).optional().default("1"),
  limit: z
    .string()
    .pipe(z.coerce.number().int().min(1).max(100))
    .optional()
    .default("20"),
  search: z.string().max(200).optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().pipe(z.coerce.number().int().positive()).optional(),
});

/**
 * URL parameter validation schemas
 */
export const projectIdParamSchema = z.object({
  projectId: z.string().pipe(z.coerce.number().int().positive()),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().pipe(z.coerce.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQueryInput = z.infer<typeof listTasksQuerySchema>;
export type ProjectIdParamInput = z.infer<typeof projectIdParamSchema>;
export type TaskIdParamInput = z.infer<typeof taskIdParamSchema>;
