import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const controller = new UserController();

router.get("/", authMiddleware, asyncHandler(controller.getAllUsers));
router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(controller.createUser),
);
router.get("/:userId", authMiddleware, asyncHandler(controller.getUserById));
router.patch(
  "/:userId",
  authMiddleware,
  validate(updateUserSchema),
  asyncHandler(controller.updateUser),
);
router.delete("/:userId", authMiddleware, asyncHandler(controller.deleteUser));

export default router;
