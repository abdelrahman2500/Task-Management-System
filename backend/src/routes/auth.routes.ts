import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import * as authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schemas";

export const authRoutes = Router();

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
