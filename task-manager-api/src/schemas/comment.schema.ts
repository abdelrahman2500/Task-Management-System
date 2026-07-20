import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string().min(1, "Body is required").max(5000),
  authorId: z.number().int().positive("authorId must be a valid user ID"),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1, "Body is required").max(5000),
});
