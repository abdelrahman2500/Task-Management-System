import { z } from "zod";

const EMAIL_MAX = 255;
const NAME_MAX = 100;
const NAME_MIN = 2;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

const REQUIRED_STRING = z.string({ message: "Required" });

export const registerSchema = z.object({
  name: REQUIRED_STRING.trim()
    .min(NAME_MIN, `Name must be at least ${NAME_MIN} characters.`)
    .max(NAME_MAX, `Name must be at most ${NAME_MAX} characters.`),
  email: REQUIRED_STRING.trim()
    .toLowerCase()
    .max(EMAIL_MAX, `Email must be at most ${EMAIL_MAX} characters.`)
    .email("Invalid email address."),
  password: REQUIRED_STRING.min(
    PASSWORD_MIN,
    `Password must be at least ${PASSWORD_MIN} characters.`,
  )
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters.`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number.")
    .regex(
      /[^\p{L}\p{N}]/u,
      "Password must contain at least one special character.",
    ),
});

export const loginSchema = z.object({
  email: REQUIRED_STRING.trim()
    .toLowerCase()
    .max(EMAIL_MAX, `Email must be at most ${EMAIL_MAX} characters.`)
    .email("Invalid email address."),
  password: REQUIRED_STRING.min(1, "Password is required.").max(
    PASSWORD_MAX,
    `Password must be at most ${PASSWORD_MAX} characters.`,
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
