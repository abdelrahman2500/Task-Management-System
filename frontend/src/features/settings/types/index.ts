export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdatePreferencesRequest {
  theme?: string;
  language?: string;
  emailNotifications?: boolean;
  taskNotifications?: boolean;
  projectNotifications?: boolean;
}

export interface UserPreferences {
  id: number;
  userId: number;
  theme: string;
  language: string;
  emailNotifications: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownedProjectsCount: number;
}
