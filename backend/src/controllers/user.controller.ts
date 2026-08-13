import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types";
import * as userService from "../services/user.service";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendPaginated,
} from "../lib/response";
import { parsePaginationParams } from "../lib/pagination";
import { ForbiddenError } from "../lib/errors";

/**
 * List all users with pagination
 */
export async function listUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = parsePaginationParams({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });

    // Check if user is admin (has any project with admin/owner role)
    // For now, allow all authenticated users to list users
    const result = await userService.listUsers(page, limit);

    // Transform to proper pagination format
    const paginated = {
      data: result.data,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.pages,
        hasNextPage: result.pagination.page < result.pagination.pages,
        hasPreviousPage: result.pagination.page > 1,
      },
    };

    sendPaginated(res, paginated);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific user by ID
 */
export async function getUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.userId);
    const user = await userService.getUser(userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.createUser(req.body);
    sendCreated(res, user);
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
    const user = await userService.updateUser(req.user!.userId, req.body);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a specific user (admin only)
 */
export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.userId);
    const user = await userService.updateUser(userId, req.body);
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
    await userService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    sendMessage(res, "Password changed successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.userId);
    await userService.deleteUser(userId);
    sendMessage(res, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}
