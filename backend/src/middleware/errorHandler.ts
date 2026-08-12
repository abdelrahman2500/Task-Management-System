import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../lib/errors";
import { getEnvironment } from "../config/environment";
import {
  logValidationError,
  logAuthError,
  logAuthorizationError,
  logNotFound,
  logConflict,
  logError,
} from "../lib/logger";

/**
 * Global error handler for all API routes.
 *
 * Handles:
 * - Application errors (BadRequest, Unauthorized, Forbidden, NotFound, Conflict, Validation)
 * - Zod validation errors
 * - Prisma errors (without exposing internals)
 * - Unknown errors (returns generic 500)
 *
 * Response format (standardized):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "User-safe error message",
 *     "details": {...}, // optional, for validation errors
 *     "requestId": "..." // for error correlation
 *   }
 * }
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const config = getEnvironment();
  const durationMs = Date.now() - req.startTime;
  const userId = (req as any).user?.userId;
  const ip = req.ip;

  // Zod validation errors (422 Unprocessable Entity)
  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    err.errors.forEach((e) => {
      const field = e.path.join(".");
      details[field] = e.message;
    });

    // Log validation error
    logValidationError(
      req.id,
      req.method,
      req.path,
      422,
      durationMs,
      details,
      userId,
      ip,
    );

    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "The request contains invalid input parameters.",
        details,
        requestId: req.id,
      },
    });
  }

  // Known application errors
  if (err instanceof AppError) {
    // Log different error types
    if (err.statusCode === 401) {
      logAuthError(req.id, req.method, req.path, err.message, ip);
    } else if (err.statusCode === 403) {
      logAuthorizationError(
        req.id,
        req.method,
        req.path,
        userId || 0,
        err.message,
        ip,
      );
    } else if (err.statusCode === 404) {
      logNotFound(req.id, req.method, req.path, userId, ip);
    } else if (err.statusCode === 409) {
      logConflict(req.id, req.method, req.path, userId || 0, err.message, ip);
    } else if (err.statusCode >= 500) {
      logError(
        req.id,
        req.method,
        req.path,
        err.statusCode,
        durationMs,
        err.code,
        err.message,
        undefined,
        userId,
        ip,
      );
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
        requestId: req.id,
      },
    });
  }

  // Prisma/Database errors - map to safe errors without exposing internals
  if (err instanceof Error) {
    const errorName = err.name || "";

    // Prisma unique constraint violation
    if (errorName === "PrismaClientKnownRequestError") {
      const prismaErr = err as any;

      // Unique constraint (P2002)
      if (prismaErr.code === "P2002") {
        const field = prismaErr.meta?.target?.[0] || "field";
        logConflict(
          req.id,
          req.method,
          req.path,
          userId || 0,
          `Conflict on field: ${field}`,
          ip,
        );

        return res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: `A record with this ${field} already exists.`,
            requestId: req.id,
          },
        });
      }

      // Foreign key constraint (P2003)
      if (prismaErr.code === "P2003") {
        logError(
          req.id,
          req.method,
          req.path,
          400,
          durationMs,
          "BAD_REQUEST",
          "Referenced record does not exist",
          undefined,
          userId,
          ip,
        );

        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "The referenced record does not exist.",
            requestId: req.id,
          },
        });
      }

      // Record not found (P2025)
      if (prismaErr.code === "P2025") {
        logNotFound(req.id, req.method, req.path, userId, ip);

        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "The requested record was not found.",
            requestId: req.id,
          },
        });
      }

      // Other Prisma errors - generic 500
      logError(
        req.id,
        req.method,
        req.path,
        500,
        durationMs,
        "INTERNAL_SERVER_ERROR",
        "Database error",
        config.server.nodeEnv === "development" ? err.message : undefined,
        userId,
        ip,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
          requestId: req.id,
        },
      });
    }
  }

  // Unexpected errors
  logError(
    req.id,
    req.method,
    req.path,
    500,
    durationMs,
    "INTERNAL_SERVER_ERROR",
    "Unexpected error occurred",
    config.server.nodeEnv === "development" && err instanceof Error
      ? err.stack
      : undefined,
    userId,
    ip,
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
      requestId: req.id,
    },
  });
}
