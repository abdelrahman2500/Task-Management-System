import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as authService from "../services/auth.service";
import { sendCreated, sendSuccess, sendMessage } from "../lib/response";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  // For JWT, logout is handled client-side by discarding the token
  sendMessage(res, "Logged out successfully");
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user's profile
 */
export async function updateMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await authService.updateMe(req.user!.userId, req.body);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Change password for current user
 */
export async function changePassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    sendMessage(res, "Password changed successfully");
  } catch (error) {
    next(error);
  }
}
