import { z } from "zod";

export const createProjectSchema = z.object({
  ownerId: z.number().min(1, "Owner ID must be at least 1"),
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100),

  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z
  .object({
    ownerId: z.number().min(1, "Owner ID must be at least 1").optional(),
    name: z
      .string()
      .min(3, "Project name must be at least 3 characters")
      .max(100)
      .optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
