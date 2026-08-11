import { z } from "zod";

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

export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const updatePreferencesSchema = z
  .object({
    theme: z.string().trim().min(1).max(50).optional(),
    language: z.string().trim().min(1).max(10).optional(),
    emailNotifications: z.boolean().optional(),
    taskNotifications: z.boolean().optional(),
    projectNotifications: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
