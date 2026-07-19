import type { ZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      next();
    } catch (error: any) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          details: [
            {
              field: error.path,
              message: error.message,
            },
          ],
        },
      });
    }
  };
