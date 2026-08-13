import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import * as userController from "../controllers/user.controller";
import { registerSchema } from "../schemas/auth.schemas";
import { z, ZodSchema } from "zod";

export const userRoutes = Router();

// Update profile schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}) as ZodSchema;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
}) as ZodSchema;

// All routes require authentication
userRoutes.use(authenticate);

// List all users
userRoutes.get("/", userController.listUsers);

// Get specific user (must come after /:userId to avoid matching /me as userId)
userRoutes.get("/:userId", userController.getUser);

// Create new user
userRoutes.post("/", validate(registerSchema), userController.createUser);

// Update specific user
userRoutes.patch(
  "/:userId",
  validate(updateProfileSchema),
  userController.updateUser,
);

// Delete user
userRoutes.delete("/:userId", userController.deleteUser);
