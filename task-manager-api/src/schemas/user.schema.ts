import { z } from "zod";
import type { Role } from "@prisma/client";

const EMAIL_MAX = 255;
const NAME_MAX = 100;
const NAME_MIN = 2;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

const nameField = z
  .string()
  .trim()
  .min(NAME_MIN, `Name must be at least ${NAME_MIN} characters.`)
  .max(NAME_MAX, `Name must be at most ${NAME_MAX} characters.`);

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX, `Email must be at most ${EMAIL_MAX} characters.`)
  .email("Invalid email address.");

const passwordField = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`)
  .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters.`)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/\d/, "Password must contain at least one number.")
  .regex(
    /[^\p{L}\p{N}]/u,
    "Password must contain at least one special character.",
  );

const roleSchema: z.ZodType<Role> = z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);

export const updateMeSchema = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateUserByAdminSchema = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
    isActive: z.boolean().optional(),
    role: roleSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const createUserByAdminSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z
    .string()
    .trim()
    .min(1, "Search term must be at least 1 character.")
    .max(100, "Search term must be at most 100 characters.")
    .optional(),
  role: roleSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;
export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
