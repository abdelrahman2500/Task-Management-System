import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100),

  description: z.string().max(500).optional(),

  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
