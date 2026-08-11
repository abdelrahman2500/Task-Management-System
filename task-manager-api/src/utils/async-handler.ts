import type { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequest = Request<any, any, any, any, any>;

export const asyncHandler =
  <R extends AnyRequest = Request>(
    fn: (req: R, res: Response, next: NextFunction) => unknown,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn(req as R, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
