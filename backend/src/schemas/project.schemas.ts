import { z } from "zod";

/**
 * Create project body validation
 */
export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
}).strict();

/**
 * Update project body validation
 */
export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
}).strict();

/**
 * Add member body validation
 */
export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
}).strict();

/**
 * Update member body validation
 */
export const updateMemberSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
}).strict();

/**
 * Query parameter validation schemas
 */
export const listQuerySchema = z.object({
  page: z.string().pipe(z.coerce.number().int().min(1)).optional().default("1"),
  limit: z
    .string()
    .pipe(z.coerce.number().int().min(1).max(100))
    .optional()
    .default("20"),
});

/**
 * URL parameter validation schemas
 */
export const projectIdParamSchema = z.object({
  projectId: z.string().pipe(z.coerce.number().int().positive()),
});

export const projectIdMemberIdParamSchema = z.object({
  projectId: z.string().pipe(z.coerce.number().int().positive()),
  memberId: z.string().pipe(z.coerce.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type ProjectIdParamInput = z.infer<typeof projectIdParamSchema>;
export type ProjectIdMemberIdParamInput = z.infer<
  typeof projectIdMemberIdParamSchema
>;
