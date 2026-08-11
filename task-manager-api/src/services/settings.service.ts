import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { UserRepository } from "../repositories/user.repository.js";
import { PreferencesRepository } from "../repositories/preferences.repository.js";
import type { SafeUser } from "../repositories/auth.repository.js";
import { AppError } from "../utils/errors/app-error.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdatePreferencesInput,
} from "../schemas/settings.schema.js";
import type { UserPreferences } from "@prisma/client";

interface AccountInfo extends SafeUser {
  ownedProjectsCount: number;
}

const DEFAULT_PREFERENCES = {
  theme: "light",
  language: "en",
  emailNotifications: true,
  taskNotifications: true,
  projectNotifications: true,
};

export class SettingsService {
  constructor(
    private userRepository = new UserRepository(),
    private preferencesRepository = new PreferencesRepository(),
  ) {}

  async getProfile(userId: number): Promise<SafeUser> {
    const user = await this.userRepository.findSafeById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }
    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileInput): Promise<SafeUser> {
    const existing = await this.userRepository.findSafeById(userId);
    if (!existing) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    if (data.email && data.email !== existing.email) {
      const conflict = await this.userRepository.findByEmail(data.email);
      if (conflict && conflict.id !== userId) {
        throw new AppError(409, "EMAIL_CONFLICT", "Email is already in use.");
      }
    }

    return this.userRepository.updateSelf(userId, {
      name: data.name,
      email: data.email,
    });
  }

  async getAccountInfo(userId: number): Promise<AccountInfo> {
    const user = await this.userRepository.findSafeById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    const ownedProjectsCount = await prisma.project.count({
      where: { ownerId: userId },
    });

    return {
      ...user,
      ownedProjectsCount,
    };
  }

  async requestDeactivateAccount(userId: number): Promise<SafeUser> {
    const user = await this.userRepository.findSafeById(userId);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    return this.userRepository.softDeleteOrDeactivate(userId);
  }

  async changePassword(
    userId: number,
    data: ChangePasswordInput,
  ): Promise<void> {
    const userWithPassword = await this.userRepository.findByEmail(
      (await this.getProfile(userId)).email,
    );

    if (!userWithPassword) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found.");
    }

    const isCurrentValid = await bcrypt.compare(
      data.currentPassword,
      userWithPassword.passwordHash,
    );

    if (!isCurrentValid) {
      throw new AppError(
        400,
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect.",
      );
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async getPreferences(userId: number): Promise<UserPreferences> {
    const existing = await this.preferencesRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.preferencesRepository.upsert(userId, DEFAULT_PREFERENCES);
  }

  async updatePreferences(
    userId: number,
    data: UpdatePreferencesInput,
  ): Promise<UserPreferences> {
    return this.preferencesRepository.upsert(userId, data);
  }
}
