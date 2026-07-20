import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors/app-error.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const field = (error.meta?.target as string[])?.[0] ?? "Field";

        req.log.warn(
          {
            requestId: req.requestId,
            err: error,
          },
          "Unique constraint violation",
        );

        return res.status(409).json({
          success: false,
          error: {
            code: "UNIQUE_CONSTRAINT",
            message: `${field} already exists.`,
          },
        });
      }

      case "P2025": {
        req.log.warn(
          {
            requestId: req.requestId,
            err: error,
          },
          "Resource not found",
        );

        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Resource not found.",
          },
        });
      }
    }
  }

  // Custom App Errors
  if (error instanceof AppError) {
    req.log.warn(
      {
        requestId: req.requestId,
        err: error,
      },
      error.message,
    );

    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Unknown Errors
  req.log.error(
    {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      err: error,
    },
    "Unhandled server error",
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
    },
  });
}
