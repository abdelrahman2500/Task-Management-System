import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { parseRequiredId } from "../utils/parse-required-id.js";
import type {
  UpdateMeInput,
  UpdateUserByAdminInput,
  CreateUserByAdminInput,
  ListUsersQueryInput,
} from "../schemas/user.schema.js";
import type { SafeUser } from "../repositories/auth.repository.js";

const service = new UserService();

interface UserParams {
  userId: string;
}

type AuthenticatedRequest<T = unknown> = Request<T, unknown, unknown, unknown> & {
  user: SafeUser;
};

export class UserController {
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const result = await service.getMe(user.id);
    return res.status(200).json({ success: true, data: result });
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const body = req.body as UpdateMeInput;
    const result = await service.updateMe(user.id, body);
    return res.status(200).json({ success: true, data: result });
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const query = req.query as ListUsersQueryInput;
    const result = await service.listUsers(user, query);
    return res.status(200).json({ success: true, data: result });
  });

  getUser = asyncHandler(async (req: Request<UserParams>, res: Response) => {
    const user = (req as AuthenticatedRequest<UserParams>).user;
    const targetId = parseRequiredId(
      req.params.userId,
      "INVALID_USER_ID",
      "Invalid user ID.",
    );
    const result = await service.getUser(user, targetId);
    return res.status(200).json({ success: true, data: result });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const body = req.body as CreateUserByAdminInput;
    const result = await service.createUserByAdmin(user, body);
    return res.status(201).json({ success: true, data: result });
  });

  updateUser = asyncHandler(async (req: Request<UserParams>, res: Response) => {
    const user = (req as AuthenticatedRequest<UserParams>).user;
    const targetId = parseRequiredId(
      req.params.userId,
      "INVALID_USER_ID",
      "Invalid user ID.",
    );
    const body = req.body as UpdateUserByAdminInput;
    const result = await service.updateUser(user, targetId, body);
    return res.status(200).json({ success: true, data: result });
  });

  deleteUser = asyncHandler(async (req: Request<UserParams>, res: Response) => {
    const user = (req as AuthenticatedRequest<UserParams>).user;
    const targetId = parseRequiredId(
      req.params.userId,
      "INVALID_USER_ID",
      "Invalid user ID.",
    );
    await service.hardDeleteUser(user, targetId);
    return res.status(204).send();
  });
}
