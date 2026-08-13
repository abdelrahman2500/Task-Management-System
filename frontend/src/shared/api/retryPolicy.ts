/**
 * Centralized Retry Policy for TanStack Query
 *
 * Implements a production-safe retry strategy that:
 * - Never retries deterministic errors (4xx errors except 429)
 * - Retries transient errors (5xx, 429, network errors)
 * - Uses bounded exponential backoff
 * - Respects Retry-After headers
 * - Prevents retry loops around authentication
 * - Protects non-idempotent mutations
 */

import { AxiosError } from "axios";
import type { DefaultError } from "@tanstack/react-query";

/**
 * Configuration for retry behavior
 */
export const RETRY_CONFIG = {
  // Maximum number of automatic retry attempts
  MAX_RETRIES: 3,
  // Maximum delay in milliseconds
  MAX_DELAY_MS: 30000,
  // Initial delay in milliseconds
  INITIAL_DELAY_MS: 1000,
  // Jitter factor (0-1, added as random percentage to delay)
  JITTER_FACTOR: 0.1,
} as const;

/**
 * Check if an error is a transient error that can be retried
 */
function isTransientError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) {
    // Network errors (no response) are transient
    return true;
  }

  const status = error.response?.status;

  // Don't retry client errors (4xx) except 429
  if (status && status >= 400 && status < 500) {
    // 429 is retryable
    if (status === 429) return true;
    // All other 4xx errors are not retryable
    return false;
  }

  // Retry server errors (5xx)
  if (status && status >= 500 && status < 600) {
    return true;
  }

  // Retry if there's no response (network error)
  if (!status) {
    return true;
  }

  return false;
}

/**
 * Parse Retry-After header
 * Supports both:
 * - Seconds: "120"
 * - HTTP-date: "Wed, 21 Oct 2025 07:28:00 GMT"
 */
function parseRetryAfter(retryAfter: string | undefined): number | null {
  if (!retryAfter) return null;

  // Try to parse as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try to parse as HTTP-date
  try {
    const retryDate = new Date(retryAfter);
    if (!isNaN(retryDate.getTime())) {
      const delay = retryDate.getTime() - Date.now();
      // Only use if it's in the future
      if (delay > 0) {
        return delay;
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(
  failureCount: number,
  retryAfter: number | null,
): number {
  // If Retry-After is provided, use it (clamped to max)
  if (retryAfter !== null) {
    return Math.min(retryAfter, RETRY_CONFIG.MAX_DELAY_MS);
  }

  // Exponential backoff: 1s, 2s, 4s
  const exponentialDelay =
    RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(2, failureCount - 1);
  const baseDelay = Math.min(exponentialDelay, RETRY_CONFIG.MAX_DELAY_MS);

  // Add jitter: random value between 0 and JITTER_FACTOR * baseDelay
  const maxJitter = baseDelay * RETRY_CONFIG.JITTER_FACTOR;
  const jitter = maxJitter * Math.random();
  const delayWithJitter = baseDelay + jitter;

  // Clamp to maximum delay (jitter might push us over)
  return Math.min(Math.floor(delayWithJitter), RETRY_CONFIG.MAX_DELAY_MS);
}

/**
 * Retry policy function for TanStack Query
 *
 * Returns true if the error should be retried, false otherwise.
 * This is the main entry point used by QueryClient configuration.
 */
export function shouldRetryOnError(
  failureCount: number,
  error: DefaultError,
): boolean {
  // Maximum retries reached
  if (failureCount > RETRY_CONFIG.MAX_RETRIES) {
    return false;
  }

  // Check if error is transient and retryable
  if (!isTransientError(error)) {
    return false;
  }

  return true;
}

/**
 * Retry delay function for TanStack Query
 *
 * Returns the delay in milliseconds before the next retry attempt.
 * This respects Retry-After headers and uses exponential backoff with jitter.
 */
export function getRetryDelay(
  failureCount: number,
  error: DefaultError,
): number {
  let retryAfter: number | null = null;

  // Try to extract Retry-After header
  if (error instanceof AxiosError && error.response?.headers) {
    const retryAfterHeader = error.response.headers["retry-after"];
    retryAfter = parseRetryAfter(retryAfterHeader);
  }

  return calculateRetryDelay(failureCount, retryAfter);
}

/**
 * Mutation-specific retry policy
 *
 * Mutations (POST, PATCH, DELETE) should not automatically retry
 * unless there's a safe idempotency mechanism.
 * Currently returns false (no retry) for all mutations.
 */
export function shouldRetryMutation(
  _failureCount: number,
  _error: DefaultError,
): boolean {
  // Don't retry mutations automatically
  // Non-idempotent operations should not be retried
  return false;
}

/**
 * Status code retry decision matrix for reference
 * | Status | Retry | Reason                    |
 * |--------|-------|---------------------------|
 * | 400    | NO    | Client error              |
 * | 401    | NO    | Authentication error      |
 * | 403    | NO    | Authorization error       |
 * | 404    | NO    | Resource not found        |
 * | 409    | NO    | Conflict                  |
 * | 422    | NO    | Validation error          |
 * | 429    | YES   | Rate limiting             |
 * | 500    | YES   | Transient server error    |
 * | 502    | YES   | Bad gateway               |
 * | 503    | YES   | Service unavailable       |
 * | 504    | YES   | Gateway timeout           |
 * | -      | YES   | Network error (no status) |
 */
