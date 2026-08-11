import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository.js";
import type { SafeUser } from "../repositories/auth.repository.js";
import { AppError } from "../utils/errors/app-error.js";
import type {
  UpdateMeInput,
  UpdateUserByAdminInput,
  CreateUserByAdminInput,
  ListUsersQueryInput,
} from "../schemas/user.schema.js";
import { can } from "../permissions/index.js";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  constructor(private repository = new UserRepository()) {}

  async getMe(userId: number): Promise<SafeUser> {
    const user = await this.repository.findSafeById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }
    return user;
  }

  async updateMe(userId: number, data: UpdateMeInput): Promise<SafeUser> {
    const existing = await this.repository.findSafeById(userId);
    if (!existing) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    if (data.email && data.email !== existing.email) {
      const conflict = await this.repository.findByEmail(data.email);
      if (conflict && conflict.id !== userId) {
        throw new AppError(409, "EMAIL_CONFLICT", "Email is already in use.");
      }
    }

    return this.repository.updateSelf(userId, {
      name: data.name,
      email: data.email,
    });
  }

  async listUsers(
    currentUser: SafeUser,
    query: ListUsersQueryInput,
  ): Promise<PaginatedResult<SafeUser>> {
    if (!can(currentUser, "manage", "users") && !can(currentUser, "read", "users")) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to list users.");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.repository.findAllPaginated({
      page,
      limit,
      search: query.search,
      role: query.role,
      isActive: query.isActive,
    });
  }

  async getUser(currentUser: SafeUser, targetId: number): Promise<SafeUser> {
    const target = await this.repository.findSafeById(targetId);
    if (!target) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    if (!can(currentUser, "read", "users", { ownerId: targetId })) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to view this user.");
    }

    return target;
  }

  async updateUser(
    currentUser: SafeUser,
    targetId: number,
    data: UpdateUserByAdminInput,
  ): Promise<SafeUser> {
    const target = await this.repository.findSafeById(targetId);
    if (!target) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    const isSelf = currentUser.id === targetId;
    const isAdmin = can(currentUser, "manage", "users");

    if (!isSelf && !isAdmin) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to update this user.");
    }

    if (data.email && data.email !== target.email) {
      const conflict = await this.repository.findByEmail(data.email);
      if (conflict && conflict.id !== targetId) {
        throw new AppError(409, "EMAIL_CONFLICT", "Email is already in use.");
      }
    }

    if (isSelf && !isAdmin) {
      const selfAllowedData: UpdateMeInput = {};
      if (data.name !== undefined) selfAllowedData.name = data.name;
      if (data.email !== undefined) selfAllowedData.email = data.email;
      if (Object.keys(selfAllowedData).length === 0) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "You can only update your own name and email.",
        );
      }
      return this.repository.updateSelf(targetId, selfAllowedData);
    }

    return this.repository.updateByAdmin(targetId, {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
    });
  }

  async createUserByAdmin(
    currentUser: SafeUser,
    data: CreateUserByAdminInput,
  ): Promise<SafeUser> {
    if (!can(currentUser, "manage", "users")) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to create users.");
    }

    const conflict = await this.repository.findByEmail(data.email);
    if (conflict) {
      throw new AppError(409, "EMAIL_CONFLICT", "Email is already in use.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.repository.createByAdmin({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      isActive: data.isActive,
    });
  }

  async deactivateUser(
    currentUser: SafeUser,
    targetId: number,
  ): Promise<SafeUser> {
    const target = await this.repository.findSafeById(targetId);
    if (!target) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    const isSelf = currentUser.id === targetId;
    const isAdmin = can(currentUser, "manage", "users");

    if (!isSelf && !isAdmin) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to deactivate this user.");
    }

    return this.repository.softDeleteOrDeactivate(targetId);
  }

  async hardDeleteUser(
    currentUser: SafeUser,
    targetId: number,
  ): Promise<void> {
    if (!can(currentUser, "manage", "users")) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to delete users.");
    }

    if (currentUser.id === targetId) {
      throw new AppError(400, "CANNOT_DELETE_SELF", "You cannot delete your own account.");
    }

    const target = await this.repository.findSafeById(targetId);
    if (!target) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    await this.repository.hardDelete(targetId);
  }
}
