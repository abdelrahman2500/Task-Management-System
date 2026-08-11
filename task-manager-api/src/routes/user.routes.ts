import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  updateMeSchema,
  updateUserByAdminSchema,
  createUserByAdminSchema,
  listUsersQuerySchema,
} from "../schemas/user.schema.js";
import { requireAdmin, requireSelfOrAdmin } from "../permissions/index.js";

const router = Router();
const controller = new UserController();

router.get("/me", authMiddleware, controller.getMe);
router.patch("/me", authMiddleware, validate(updateMeSchema), controller.updateMe);

router.get(
  "/",
  authMiddleware,
  requireAdmin(),
  validate(listUsersQuerySchema, "query"),
  controller.listUsers,
);
router.post(
  "/",
  authMiddleware,
  requireAdmin(),
  validate(createUserByAdminSchema),
  controller.createUser,
);

router.get(
  "/:userId",
  authMiddleware,
  requireSelfOrAdmin("userId"),
  controller.getUser,
);
router.patch(
  "/:userId",
  authMiddleware,
  requireSelfOrAdmin("userId"),
  validate(updateUserByAdminSchema),
  controller.updateUser,
);
router.delete(
  "/:userId",
  authMiddleware,
  requireAdmin(),
  controller.deleteUser,
);

export default router;
