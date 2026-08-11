import { z } from "zod";
import type { UserRole } from "../../auth/types";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const).optional(),
  isActive: z.boolean().optional(),
});

export const updateMeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateMeFormData = z.infer<typeof updateMeSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};
