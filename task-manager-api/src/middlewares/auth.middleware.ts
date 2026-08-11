import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors/app-error.js";

const repository = new AuthRepository();

const AUTH_REQUIRED = "Authentication is required.";
const INVALID_TOKEN = "Invalid or expired access token.";

function extractBearerToken(authorization?: string): string | null {
  if (!authorization) return null;
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  if (token.includes(" ")) return null;
  return token;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next(new AppError(401, "UNAUTHORIZED", AUTH_REQUIRED));
  }

  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch (error: unknown) {
    if (
      error instanceof jwt.TokenExpiredError) {
        return next(new AppError(401, "TOKEN_EXPIRED", INVALID_TOKEN));
      }
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
        return next(new AppError(401, "INVALID_TOKEN", INVALID_TOKEN));
      }
      return next(error);
  }

  if (!payload || typeof payload.userId !== "number") {
    return next(new AppError(401, "INVALID_TOKEN", INVALID_TOKEN));
  }

  let user;
  try {
    user = await repository.findSafeById(payload.userId);
  } catch (error: unknown) {
    return next(error);
  }

  if (!user || !user.isActive) {
    return next(new AppError(401, "UNAUTHORIZED", AUTH_REQUIRED));
  }

  req.user = user;
  return next();
}
