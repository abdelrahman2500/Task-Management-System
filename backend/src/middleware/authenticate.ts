import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, AuthPayload } from "../types";
import { UnauthorizedError } from "../lib/errors";
import { getEnvironment } from "../config/environment";

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or invalid authorization header"),
    );
  }

  const token = header.slice(7);

  try {
    const config = getEnvironment();
    const secret = config.jwt.secret;

    // Verify token signature and expiration
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as AuthPayload;

    // Validate required claims
    if (!payload.userId || typeof payload.userId !== "number") {
      throw new Error("Invalid userId in token");
    }

    if (!payload.email || typeof payload.email !== "string") {
      throw new Error("Invalid email in token");
    }

    req.user = payload;
    next();
  } catch (error) {
    // Log the error type without exposing details to client
    const errorMessage =
      error instanceof jwt.TokenExpiredError
        ? "Token has expired"
        : error instanceof jwt.JsonWebTokenError
          ? "Invalid token"
          : "Authentication failed";

    next(new UnauthorizedError(errorMessage));
  }
}
