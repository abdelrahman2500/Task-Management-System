/**
 * User-friendly error message mapping
 *
 * Maps backend error codes and HTTP status codes to user-facing messages.
 * Ensures consistent, understandable error messages throughout the frontend.
 */

type ErrorCodeMessage = Record<string, string>;

const ERROR_CODE_MESSAGES: ErrorCodeMessage = {
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
  VALIDATION_ERROR: "Please check the entered information.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PASSWORD: "Password must be at least 8 characters.",
  WEAK_PASSWORD:
    "Password must contain uppercase, lowercase, numbers, and special characters.",
  RATE_LIMIT_EXCEEDED:
    "Too many requests. Please wait a moment before trying again.",

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
export function getErrorMessageForCode(errorCode: string): string {
  return (
    ERROR_CODE_MESSAGES[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}

/**
 * Get user-friendly error message for an HTTP status code
 */
export function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return "Please check the entered information.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Something went wrong. Please try again.";
    case 503:
      return "The service is temporarily unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Get user-friendly message from any error
 * Tries to extract error code first, then falls back to status code or generic message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Try to extract error code from API response
  const apiError = (error as any)?.response?.data?.error;
  if (apiError?.code) {
    return getErrorMessageForCode(apiError.code);
  }

  // Fall back to HTTP status code
  const status = (error as any)?.response?.status;
  if (status) {
    return getErrorMessageForStatus(status);
  }

  // Last resort - generic message
  return "An unexpected error occurred. Please try again.";
}
