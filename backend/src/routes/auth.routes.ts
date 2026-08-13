import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import * as authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schemas";
import { z, ZodSchema } from "zod";

export const authRoutes = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}) as ZodSchema;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
}) as ZodSchema;

// Auth endpoints have stricter rate limiting (5 attempts per 15 minutes)
authRoutes.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
authRoutes.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.login,
);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authenticate, authController.getMe);

// Profile update endpoints
authRoutes.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  authController.updateMe,
);
authRoutes.patch(
  "/me/password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
