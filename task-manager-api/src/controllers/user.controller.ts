import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto.js";
import { createOrUpdateUserSchema } from "../dto/user/create-user.schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/errors/app-error.js";
import { parseRequiredId } from "../utils/parse-required-id.js";

const service = new UserService();

export class UserController {
  getAllUsers = asyncHandler(async (_: Request, res: Response) => {
    const users = await service.getAllUsers();
    return res.json({ success: true, data: users });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseRequiredId(
      req.params.userId,
      "INVALID_USER_ID",
      "Invalid user ID",
    );
    const user = await service.getUserById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return res.json({ success: true, data: user });
  });

  createUser = asyncHandler(
    async (req: Request<{}, {}, CreateUserDto>, res: Response) => {
      const { name, email, password, isActive } = req.body;

      if (!name) {
        throw new AppError(400, "MISSING_NAME", "Name is required");
      }
      if (!email) {
        throw new AppError(400, "MISSING_EMAIL", "Email is required");
      }
      if (!password) {
        throw new AppError(400, "MISSING_PASSWORD", "password is required");
      }

      const body = createOrUpdateUserSchema.parse(req.body);
      const user = await service.createUser(body);
      return res.status(201).json({ success: true, data: user });
    },
  );

  updateUser = asyncHandler(
    async (req: Request<{ userId: string }, {}, UpdateUserDto>, res: Response) => {
      const userId = parseRequiredId(
        req.params.userId,
        "INVALID_USER_ID",
        "Invalid user ID",
      );

      const body = createOrUpdateUserSchema.parse(req.body);
      const user = await service.updateUser(userId, body);
      return res.json({ success: true, data: user });
    },
  );

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseRequiredId(
      req.params.userId,
      "INVALID_USER_ID",
      "Invalid user ID",
    );
    await service.deleteUser(userId);
    return res.json({ success: true, message: "User deleted successfully" });
  });
}
