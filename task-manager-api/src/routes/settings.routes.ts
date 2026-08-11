import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} from "../schemas/settings.schema.js";

const router = Router();
const controller = new SettingsController();

// All settings routes require authentication.
// Authorization is implicit — the service always uses req.user.id,
// so users can only ever access their own settings.
router.use(authMiddleware);

router.get("/profile", controller.getProfile);
router.patch(
  "/profile",
  validate(updateProfileSchema),
  controller.updateProfile,
);

router.get("/account", controller.getAccount);
router.delete("/account", controller.deactivateAccount);

router.patch(
  "/security/password",
  validate(changePasswordSchema),
  controller.changePassword,
);

router.get("/preferences", controller.getPreferences);
router.patch(
  "/preferences",
  validate(updatePreferencesSchema),
  controller.updatePreferences,
);

export default router;
