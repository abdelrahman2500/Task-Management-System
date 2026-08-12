/**
 * User-friendly error message mapping
 *
 * Maps technical error codes to messages suitable for display to end users.
 * This layer ensures consistent, safe error messaging across the API.
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication & Authorization
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  PROJECT_ACCESS_DENIED: "You don't have access to this project.",
  TASK_ACCESS_DENIED: "You don't have access to this task.",
  COMMENT_ACCESS_DENIED: "You don't have access to this comment.",

  // Resource Not Found
  NOT_FOUND: "The requested resource could not be found.",
  PROJECT_NOT_FOUND: "Project not found.",
  TASK_NOT_FOUND: "Task not found.",
  COMMENT_NOT_FOUND: "Comment not found.",
  USER_NOT_FOUND: "User not found.",

  // Conflicts
  CONFLICT: "This resource already exists.",
  USER_ALREADY_EXISTS: "A user with this email already exists.",
  MEMBER_ALREADY_EXISTS: "This user is already a member of this project.",

  // Validation
  VALIDATION_FAILED: "Please check the entered information.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PASSWORD: "Password must be at least 8 characters.",
  WEAK_PASSWORD:
    "Password must contain uppercase, lowercase, numbers, and special characters.",

  // Server Errors
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
  DATABASE_ERROR: "A database error occurred. Please try again.",
  SERVICE_UNAVAILABLE:
    "The service is temporarily unavailable. Please try again later.",

  // Bad Requests
  BAD_REQUEST: "Invalid request. Please check your input.",
  MISSING_REQUIRED_FIELD: "Required field is missing.",
  INVALID_INPUT: "The provided input is invalid.",
};

/**
 * Get user-friendly error message for an error code
 */
export function getUserFriendlyMessage(errorCode: string): string {
  return (
    ERROR_MESSAGES[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}
