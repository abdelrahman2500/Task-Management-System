/**
 * Error handling utilities
 *
 * Provides standardized error parsing, type checking, and user-friendly message generation.
 * All errors should be handled through these utilities to ensure consistency.
 * Includes timeout and cancellation error classification.
 */

import { AxiosError } from "axios";
import { getUserFriendlyErrorMessage } from "./errorMessages";
import {
  isAbortError,
  isTimeoutError,
  getTimeoutCancellationMessage,
} from "../api/cancellation";

// API Error Response interface (matching backend)
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string | string[]>;
  };
}

/**
 * Extract error message from various error types
 * Returns the most relevant error message available
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  // Handle API errors with structured response
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "error" in error.response.data
  ) {
    const apiError = error.response.data as ApiErrorResponse;
    return apiError.error.message || "An API error occurred";
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    return error.message || "A network error occurred";
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Fallback
  return "An unexpected error occurred";
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    (error.response.status === 400 || error.response.status === 422)
  ) {
    const response = error.response as { data?: ApiErrorResponse };
    return (
      response.data?.error?.code === "VALIDATION_ERROR" ||
      response.data?.error?.code === "VALIDATION_FAILED"
    );
  }

  return false;
}

/**
 * Extract field-specific validation errors
 */
export function extractValidationErrors(
  error: unknown,
): Record<string, string> {
  if (!isValidationError(error)) return {};

  const response = (error as any).response;
  const details = response?.data?.error?.details;

  if (!details || typeof details !== "object") return {};

  const fieldErrors: Record<string, string> = {};

  // Convert details to string messages
  for (const [field, message] of Object.entries(details)) {
    if (Array.isArray(message)) {
      fieldErrors[field] = message[0]; // Take first error message
    } else if (typeof message === "string") {
      fieldErrors[field] = message;
    }
  }

  return fieldErrors;
}

/**
 * Handle and log API errors consistently
 * Returns user-friendly error message
 */
export function handleApiError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error);

  // Use user-friendly message mapper for API errors
  const message = getUserFriendlyErrorMessage(error) || getErrorMessage(error);

  // You could add additional logging, error reporting, or analytics here
  // Example: sendErrorToAnalytics(error, context);

  return message;
}

/**
 * Create a formatted error for user display
 */
export function createUserFriendlyError(
  error: unknown,
  fallbackMessage: string = "Something went wrong. Please try again.",
): {
  message: string;
  isValidation: boolean;
  fieldErrors: Record<string, string>;
} {
  const isValidation = isValidationError(error);

  return {
    message: isValidation
      ? "Please fix the errors below"
      : getUserFriendlyErrorMessage(error) || fallbackMessage,
    isValidation,
    fieldErrors: extractValidationErrors(error),
  };
}

/**
 * Retry logic for API calls
 * Retries on server errors (5xx) or network issues, but not client errors (4xx)
 * Does NOT retry on rate limit errors (429) - these must be shown to user
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx), only server errors (5xx) or network issues
      // Special case: 429 (rate limit) must not be retried - show to user
      if (
        error instanceof AxiosError &&
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        throw error; // Don't retry client errors
      }

      if (attempt === maxRetries) {
        break; // Don't delay after the last attempt
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Common error codes (matching backend)
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  CONFLICT: "CONFLICT",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT: "TIMEOUT",
} as const;

/**
 * Check specific error types
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 401) {
    return true;
  }

  const response = (error as any)?.response;
  return response?.data?.error?.code === ERROR_CODES.UNAUTHORIZED;
}

export function isForbiddenError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 403) {
    return true;
  }

  const response = (error as any)?.response;
  return response?.data?.error?.code === ERROR_CODES.FORBIDDEN;
}

export function isNotFoundError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 404) {
    return true;
  }

  const response = (error as any)?.response;
  return response?.data?.error?.code === ERROR_CODES.NOT_FOUND;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return (
      !error.response &&
      (error.code === "NETWORK_ERROR" || error.code === "ECONNREFUSED")
    );
  }

  return false;
}

export function isConflictError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 409) {
    return true;
  }

  const response = (error as any)?.response;
  return response?.data?.error?.code === ERROR_CODES.CONFLICT;
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 429) {
    return true;
  }

  const response = (error as any)?.response;
  return response?.data?.error?.code === "RATE_LIMIT_EXCEEDED";
}

export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status) {
    return error.response.status >= 500 && error.response.status < 600;
  }

  return false;
}

export function isClientError(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status) {
    return error.response.status >= 400 && error.response.status < 500;
  }

  return false;
}

export function isAbortedError(error: unknown): boolean {
  return isAbortError(error);
}

export function isTimeoutErrorType(error: unknown): boolean {
  return isTimeoutError(error);
}
