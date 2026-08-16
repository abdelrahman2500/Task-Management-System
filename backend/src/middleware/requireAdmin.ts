import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types";
import { prisma } from "../lib/prisma";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";

/** Requires an explicitly provisioned global administrator account. */
export async function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new UnauthorizedError());
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return next(new ForbiddenError());
    }

    next();
  } catch (error) {
    next(error);
  }
}
