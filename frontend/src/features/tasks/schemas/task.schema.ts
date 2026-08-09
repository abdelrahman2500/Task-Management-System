import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),

  description: z.string().max(1000).optional().nullable(),

  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),

  assigneeId: z.number().nullable().optional(),

  projectId: z.number({ required_error: "Project is required" }),

  dueDate: z.string().nullable().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
