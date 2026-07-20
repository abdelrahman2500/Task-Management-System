import { z } from "zod";

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assigneeId: z.number().int().positive().optional().nullable(),
  createdBy: z.number().int().positive("createdBy must be a valid user ID"),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    assigneeId: z.number().int().positive().optional().nullable(),
    createdBy: z.number().int().positive().optional(),
    projectId: z.number().int().positive().optional(),
    dueDate: z.string().datetime().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
