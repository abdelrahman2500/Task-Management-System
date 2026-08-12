import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),

  description: z.string().max(1000).optional().nullable(),

  status: z.enum(["todo", "in_progress", "blocked", "done"]),

  priority: z.enum(["low", "medium", "high", "urgent"]),

  assigneeId: z.number().nullable().optional(),

  projectId: z.number({ error: "Project is required" }),

  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid due date")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type TaskFormData = z.infer<typeof taskSchema>;
