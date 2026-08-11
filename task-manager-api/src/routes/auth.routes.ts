import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const controller = new AuthController();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler((req, res) => controller.register(req, res)),
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler((req, res) => controller.login(req, res)),
);
router.post(
  "/logout",
  authMiddleware,
  asyncHandler((req, res) => controller.logout(req, res)),
);
router.get(
  "/me",
  authMiddleware,
  asyncHandler((req, res) => controller.me(req, res)),
);

export default router;
