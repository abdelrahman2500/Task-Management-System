import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateMemberSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
