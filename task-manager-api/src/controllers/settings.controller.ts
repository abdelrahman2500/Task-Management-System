import type { Request, Response } from "express";
import { SettingsService } from "../services/settings.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/errors/app-error.js";
import type { SafeUser } from "../repositories/auth.repository.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdatePreferencesInput,
} from "../schemas/settings.schema.js";

type AuthRequest = Request & { user: SafeUser };

const service = new SettingsService();

export class SettingsController {
  /** GET /settings/profile */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const profile = await service.getProfile(user.id);
    return res.json({ success: true, data: profile });
  });

  /** PATCH /settings/profile */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const body = req.body as UpdateProfileInput;
    const updated = await service.updateProfile(user.id, body);
    return res.json({ success: true, data: updated });
  });

  /** GET /settings/account */
  getAccount = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const account = await service.getAccountInfo(user.id);
    return res.json({ success: true, data: account });
  });

  /** DELETE /settings/account — deactivate own account */
  deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    await service.requestDeactivateAccount(user.id);
    return res.json({
      success: true,
      message: "Account deactivated successfully.",
    });
  });

  /** PATCH /settings/security/password */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const body = req.body as ChangePasswordInput;
    await service.changePassword(user.id, body);
    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  });

  /** GET /settings/preferences */
  getPreferences = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const prefs = await service.getPreferences(user.id);
    return res.json({ success: true, data: prefs });
  });

  /** PATCH /settings/preferences */
  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const body = req.body as UpdatePreferencesInput;
    const prefs = await service.updatePreferences(user.id, body);
    return res.json({ success: true, data: prefs });
  });
}
