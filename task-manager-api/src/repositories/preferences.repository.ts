import prisma from "../config/prisma.js";
import type { UserPreferences } from "@prisma/client";

interface UpsertPreferencesData {
  theme?: string;
  language?: string;
  emailNotifications?: boolean;
  taskNotifications?: boolean;
  projectNotifications?: boolean;
}

export class PreferencesRepository {
  async findByUserId(userId: number): Promise<UserPreferences | null> {
    return prisma.userPreferences.findUnique({
      where: { userId },
    });
  }

  async upsert(
    userId: number,
    data: UpsertPreferencesData,
  ): Promise<UserPreferences> {
    // Build only the fields that were actually provided
    const updateData: Partial<UpsertPreferencesData> = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.emailNotifications !== undefined)
      updateData.emailNotifications = data.emailNotifications;
    if (data.taskNotifications !== undefined)
      updateData.taskNotifications = data.taskNotifications;
    if (data.projectNotifications !== undefined)
      updateData.projectNotifications = data.projectNotifications;

    return prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });
  }
}
