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
