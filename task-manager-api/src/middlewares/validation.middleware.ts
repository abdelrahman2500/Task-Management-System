import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/app-error.js";

type ValidateTarget = "body" | "params" | "query";

function buildDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.length === 0 ? "_" : issue.path.join("."),
    message: issue.message,
  }));
}

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const input = req[target];
      const parsed = schema.parse(input);
      req[target] = parsed;
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return next(
          new AppError(422, "VALIDATION_FAILED", "Request validation failed.").withDetails(
            buildDetails(error),
          ),
        );
      }
      return next(error);
    }
  };
}
