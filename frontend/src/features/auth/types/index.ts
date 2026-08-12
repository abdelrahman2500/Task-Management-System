/**
 * Auth Feature Types
 *
 * Imports core API types from generated OpenAPI types.
 * Defines UI-specific extensions only.
 */

export type {
  User,
  LoginRequest,
  AuthResponse as LoginResponse,
  RegisterRequest,
} from "../../../shared/api/generated/types";

/**
 * UserRole for permission checks and UI display
 * This matches the role values used throughout the application
 */
export type UserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

/**
 * UI-specific CurrentUser type
 * Extends the generated User with additional properties needed for auth context
 */
export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
