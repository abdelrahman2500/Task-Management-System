import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string().min(1).max(1000),
}).strict();

export const updateCommentSchema = z.object({
  body: z.string().min(1).max(1000),
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
export const taskIdParamSchema = z.object({
  taskId: z.string().pipe(z.coerce.number().int().positive()),
});

export const commentIdParamSchema = z.object({
  commentId: z.string().pipe(z.coerce.number().int().positive()),
});

/**
 * Type exports
 */
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type TaskIdParamInput = z.infer<typeof taskIdParamSchema>;
export type CommentIdParamInput = z.infer<typeof commentIdParamSchema>;
