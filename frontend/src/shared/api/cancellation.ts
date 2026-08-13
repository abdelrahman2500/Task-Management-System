/**
 * Request Cancellation and Timeout Configuration
 *
 * Implements AbortSignal propagation and timeout handling for the API layer.
 * Integrates with TanStack Query for intelligent request cancellation.
 */

import { AxiosError } from "axios";
import type { DefaultError } from "@tanstack/react-query";

/**
 * Timeout configuration
 */
export const TIMEOUT_CONFIG = {
  // Default timeout for all API requests (30 seconds)
  DEFAULT_MS: 30000,
  // Maximum timeout (cannot exceed this value)
  MAX_MS: 60000,
  // Minimum timeout (must be at least this value)
  MIN_MS: 1000,
} as const;

/**
 * Get timeout from environment or use default
 * Returns a validated timeout value between MIN_MS and MAX_MS
 */
export function getConfiguredTimeout(): number {
  const envTimeout = import.meta.env.VITE_API_TIMEOUT_MS;

  if (!envTimeout) {
    return TIMEOUT_CONFIG.DEFAULT_MS;
  }

  const parsed = parseInt(envTimeout, 10);

  // Validate timeout is a number
  if (isNaN(parsed)) {
    console.warn(
      `Invalid VITE_API_TIMEOUT_MS: ${envTimeout}, using default ${TIMEOUT_CONFIG.DEFAULT_MS}ms`,
    );
    return TIMEOUT_CONFIG.DEFAULT_MS;
  }

  // Clamp to valid range
  const clamped = Math.max(
    TIMEOUT_CONFIG.MIN_MS,
    Math.min(parsed, TIMEOUT_CONFIG.MAX_MS),
  );

  if (clamped !== parsed) {
    console.warn(
      `VITE_API_TIMEOUT_MS clamped from ${parsed}ms to ${clamped}ms`,
    );
  }

  return clamped;
}

/**
 * Request options that can be passed through the API layer
 * Supports cancellation and per-request timeout overrides
 */
export interface RequestOptions {
  /**
   * AbortSignal for request cancellation
   * Typically provided by TanStack Query
   */
  signal?: AbortSignal;

  /**
   * Per-request timeout override (milliseconds)
   * If not provided, uses TIMEOUT_CONFIG.DEFAULT_MS
   */
  timeout?: number;
}

/**
 * Check if an error is an abort error (user-initiated or TanStack Query cancellation)
 */
export function isAbortError(error: unknown): boolean {
  // Handle AbortError from AbortController
  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }

  // Handle Axios error wrapping AbortError
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") {
      // ECONNABORTED could be abort or timeout - disambiguate
      // If message contains "timeout", it's a timeout not an abort
      if (error.message && error.message.toLowerCase().includes("timeout")) {
        return false;
      }
      // If signal was explicitly provided, treat as abort
      if (error.config?.signal) {
        return true;
      }
      // Without clear timeout or signal indication, assume not abort
      return false;
    }
  }

  return false;
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  // Handle Axios timeout error
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED" && error.message?.includes("timeout")) {
      return true;
    }
    // Timeout with AbortSignal results in ECONNABORTED
    // Additional check: if signal was provided and aborted, it's a cancellation not timeout
    if (error.code === "ECONNABORTED" && !error.config?.signal) {
      // ECONNABORTED without signal = timeout
      return true;
    }
  }

  return false;
}

/**
 * Distinguish between different failure types
 */
export function classifyRequestError(error: unknown): {
  type: "abort" | "timeout" | "network" | "http" | "unknown";
  retryable: boolean;
} {
  // Abort errors (user cancelled, TanStack Query cancelled)
  if (isAbortError(error)) {
    return {
      type: "abort",
      retryable: false, // Never retry cancellations
    };
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    return {
      type: "timeout",
      retryable: true, // Timeouts are retryable per retry policy
    };
  }

  // HTTP errors (Axios error with status code)
  if (error instanceof AxiosError) {
    if (error.response?.status) {
      return {
        type: "http",
        retryable: true, // HTTP errors follow retry policy
      };
    }

    // No response but not abort/timeout = network error
    return {
      type: "network",
      retryable: true, // Network errors are retryable per retry policy
    };
  }

  // Unknown error type
  return {
    type: "unknown",
    retryable: false,
  };
}

/**
 * Check if an error should NOT be retried
 * Used by retry policy to ensure abort errors are never retried
 */
export function shouldNotRetryError(error: DefaultError): boolean {
  // Never retry abort/cancellation errors
  return isAbortError(error);
}

/**
 * Get user-friendly error message for timeout/cancellation
 */
export function getTimeoutCancellationMessage(error: unknown): string | null {
  if (isAbortError(error)) {
    // User/system cancelled the request
    return "Request was cancelled. Please try again if needed.";
  }

  if (isTimeoutError(error)) {
    // Request took too long
    return "Request took too long to complete. Please check your connection and try again.";
  }

  return null;
}

/**
 * Timeout error classification matrix
 *
 * | Error Type | Classified As | Retryable | Message |
 * |---|---|---|---|
 * | AbortError | abort | NO | Request was cancelled |
 * | ECONNABORTED (signal) | abort | NO | Request was cancelled |
 * | ECONNABORTED (timeout) | timeout | YES | Request took too long |
 * | ECONNREFUSED | network | YES | Connection refused |
 * | ETIMEDOUT | timeout | YES | Request took too long |
 * | ENOTFOUND | network | YES | Domain not found |
 * | ECONNRESET | network | YES | Connection reset |
 * | 4xx (except 429) | http | NO | [HTTP error] |
 * | 429 | http | YES | Rate limited |
 * | 5xx | http | YES | Server error |
 */
