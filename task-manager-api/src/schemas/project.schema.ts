import { z } from "zod";

const projectStatusEnum = z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]);

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: projectStatusEnum.optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(3, "Project name must be at least 3 characters")
      .max(100, "Project name must be at most 100 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters")
      .nullable()
      .optional(),
    status: projectStatusEnum.optional(),
    ownerId: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: projectStatusEnum.optional(),
  ownerId: z.coerce.number().int().positive().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
