import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as authController from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schemas";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), authController.register);
authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authenticate, authController.getMe);
