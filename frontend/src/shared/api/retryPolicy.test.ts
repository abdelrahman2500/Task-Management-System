import { describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import {
  shouldRetryOnError,
  getRetryDelay,
  shouldRetryMutation,
  RETRY_CONFIG,
} from "./retryPolicy";

/**
 * Test suite for retry policy
 *
 * Verifies that:
 * - Deterministic errors (4xx) are never retried
 * - Transient errors (5xx, 429, network) are retried
 * - Exponential backoff is calculated correctly
 * - Retry-After header is respected
 * - Maximum retries and delays are enforced
 * - Mutations don't retry by default
 */

describe("Retry Policy", () => {
  describe("shouldRetryOnError - 4xx Errors (Non-Retryable)", () => {
    it("should not retry 400 Bad Request", () => {
      const error = new AxiosError("Bad Request");
      error.response = { status: 400, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry 401 Unauthorized", () => {
      const error = new AxiosError("Unauthorized");
      error.response = { status: 401, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry 403 Forbidden", () => {
      const error = new AxiosError("Forbidden");
      error.response = { status: 403, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry 404 Not Found", () => {
      const error = new AxiosError("Not Found");
      error.response = { status: 404, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry 409 Conflict", () => {
      const error = new AxiosError("Conflict");
      error.response = { status: 409, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry 422 Validation Error", () => {
      const error = new AxiosError("Validation Error");
      error.response = { status: 422, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(false);
    });
  });

  describe("shouldRetryOnError - 5xx Errors (Retryable)", () => {
    it("should retry 500 Internal Server Error", () => {
      const error = new AxiosError("Internal Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });

    it("should retry 502 Bad Gateway", () => {
      const error = new AxiosError("Bad Gateway");
      error.response = { status: 502, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });

    it("should retry 503 Service Unavailable", () => {
      const error = new AxiosError("Service Unavailable");
      error.response = { status: 503, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });

    it("should retry 504 Gateway Timeout", () => {
      const error = new AxiosError("Gateway Timeout");
      error.response = { status: 504, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });
  });

  describe("shouldRetryOnError - Rate Limiting (429)", () => {
    it("should retry 429 Too Many Requests", () => {
      const error = new AxiosError("Too Many Requests");
      error.response = { status: 429, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });
  });

  describe("shouldRetryOnError - Network Errors", () => {
    it("should retry network errors (no response)", () => {
      const error = new AxiosError("Network Error");
      // No response property = network error

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });

    it("should retry when response is undefined", () => {
      const error = new AxiosError("Network Error");
      error.response = undefined;

      const shouldRetry = shouldRetryOnError(1, error);
      expect(shouldRetry).toBe(true);
    });
  });

  describe("shouldRetryOnError - Max Retries", () => {
    it("should not retry after maximum retries reached", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(
        RETRY_CONFIG.MAX_RETRIES + 1,
        error,
      );
      expect(shouldRetry).toBe(false);
    });

    it("should retry up to maximum retries", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryOnError(RETRY_CONFIG.MAX_RETRIES, error);
      expect(shouldRetry).toBe(true);
    });
  });

  describe("getRetryDelay - Exponential Backoff", () => {
    it("should calculate exponential backoff for first retry", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const delay = getRetryDelay(1, error);
      // First retry: ~1 second (1000ms)
      expect(delay).toBeGreaterThanOrEqual(RETRY_CONFIG.INITIAL_DELAY_MS * 0.9);
      expect(delay).toBeLessThanOrEqual(
        RETRY_CONFIG.INITIAL_DELAY_MS * (1 + RETRY_CONFIG.JITTER_FACTOR),
      );
    });

    it("should calculate exponential backoff for second retry", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const delay = getRetryDelay(2, error);
      // Second retry: ~2 seconds (2000ms)
      const expectedBase = RETRY_CONFIG.INITIAL_DELAY_MS * 2;
      expect(delay).toBeGreaterThanOrEqual(expectedBase * 0.9);
      expect(delay).toBeLessThanOrEqual(
        expectedBase * (1 + RETRY_CONFIG.JITTER_FACTOR),
      );
    });

    it("should calculate exponential backoff for third retry", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const delay = getRetryDelay(3, error);
      // Third retry: ~4 seconds (4000ms)
      const expectedBase = RETRY_CONFIG.INITIAL_DELAY_MS * 4;
      expect(delay).toBeGreaterThanOrEqual(expectedBase * 0.9);
      expect(delay).toBeLessThanOrEqual(
        expectedBase * (1 + RETRY_CONFIG.JITTER_FACTOR),
      );
    });
  });

  describe("getRetryDelay - Maximum Delay Clamping", () => {
    it("should not exceed maximum delay", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      // Simulate many retries that would exceed max delay
      const delay = getRetryDelay(100, error);
      expect(delay).toBeLessThanOrEqual(RETRY_CONFIG.MAX_DELAY_MS);
    });
  });

  describe("getRetryDelay - Jitter", () => {
    it("should add jitter to delays", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      // Calculate delays multiple times - they should vary due to jitter
      const delays = Array.from({ length: 10 }, () => getRetryDelay(1, error));

      // Check that not all delays are identical (jitter is working)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it("should not exceed base delay by more than jitter factor", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const baseDelay = RETRY_CONFIG.INITIAL_DELAY_MS;
      const maxJitter = baseDelay * RETRY_CONFIG.JITTER_FACTOR;

      const delay = getRetryDelay(1, error);
      expect(delay - baseDelay).toBeLessThanOrEqual(maxJitter);
    });
  });

  describe("getRetryDelay - Retry-After Header", () => {
    it("should respect Retry-After header (seconds format)", () => {
      const error = new AxiosError("Too Many Requests");
      error.response = {
        status: 429,
        data: {},
        headers: { "retry-after": "5" },
      } as any;

      const delay = getRetryDelay(1, error);
      // Should be ~5 seconds from Retry-After
      expect(delay).toBeGreaterThanOrEqual(5000 * 0.95);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it("should clamp Retry-After to maximum delay", () => {
      const error = new AxiosError("Too Many Requests");
      // Set Retry-After to 60 seconds (exceeds max of 30 seconds)
      error.response = {
        status: 429,
        data: {},
        headers: { "retry-after": "60" },
      } as any;

      const delay = getRetryDelay(1, error);
      expect(delay).toBeLessThanOrEqual(RETRY_CONFIG.MAX_DELAY_MS);
      expect(delay).toBeGreaterThanOrEqual(RETRY_CONFIG.MAX_DELAY_MS * 0.95);
    });

    it("should fallback to exponential backoff for invalid Retry-After", () => {
      const error = new AxiosError("Server Error");
      error.response = {
        status: 500,
        data: {},
        headers: { "retry-after": "invalid-date" },
      } as any;

      const delay = getRetryDelay(1, error);
      // Should use exponential backoff, not Retry-After
      const expectedBase = RETRY_CONFIG.INITIAL_DELAY_MS;
      expect(delay).toBeGreaterThanOrEqual(expectedBase * 0.9);
      expect(delay).toBeLessThanOrEqual(expectedBase * 1.2);
    });

    it("should handle missing Retry-After header", () => {
      const error = new AxiosError("Too Many Requests");
      error.response = { status: 429, data: {}, headers: {} } as any;

      const delay = getRetryDelay(1, error);
      // Should use exponential backoff
      const expectedBase = RETRY_CONFIG.INITIAL_DELAY_MS;
      expect(delay).toBeGreaterThanOrEqual(expectedBase * 0.9);
      expect(delay).toBeLessThanOrEqual(expectedBase * 1.2);
    });
  });

  describe("shouldRetryMutation - Non-Idempotent Protection", () => {
    it("should not retry mutations by default", () => {
      const error = new AxiosError("Server Error");
      error.response = { status: 500, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryMutation(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry mutations even for transient errors", () => {
      const error = new AxiosError("Network Error");
      // Network error (transient)

      const shouldRetry = shouldRetryMutation(1, error);
      expect(shouldRetry).toBe(false);
    });

    it("should not retry mutations even for 429 rate limit", () => {
      const error = new AxiosError("Too Many Requests");
      error.response = { status: 429, data: {}, headers: {} } as any;

      const shouldRetry = shouldRetryMutation(1, error);
      expect(shouldRetry).toBe(false);
    });
  });

  describe("Retry Policy Matrix - Status Codes", () => {
    const statusCodeTests = [
      { status: 400, shouldRetry: false, name: "400 Bad Request" },
      { status: 401, shouldRetry: false, name: "401 Unauthorized" },
      { status: 403, shouldRetry: false, name: "403 Forbidden" },
      { status: 404, shouldRetry: false, name: "404 Not Found" },
      { status: 409, shouldRetry: false, name: "409 Conflict" },
      { status: 422, shouldRetry: false, name: "422 Validation Error" },
      { status: 429, shouldRetry: true, name: "429 Rate Limit" },
      { status: 500, shouldRetry: true, name: "500 Server Error" },
      { status: 502, shouldRetry: true, name: "502 Bad Gateway" },
      { status: 503, shouldRetry: true, name: "503 Service Unavailable" },
      { status: 504, shouldRetry: true, name: "504 Gateway Timeout" },
    ];

    statusCodeTests.forEach(({ status, shouldRetry, name }) => {
      it(`should ${shouldRetry ? "" : "NOT "}retry ${name}`, () => {
        const error = new AxiosError(name);
        error.response = { status, data: {}, headers: {} } as any;

        const result = shouldRetryOnError(1, error);
        expect(result).toBe(shouldRetry);
      });
    });
  });

  describe("Retry Configuration Constants", () => {
    it("should have valid retry configuration", () => {
      expect(RETRY_CONFIG.MAX_RETRIES).toBeGreaterThan(0);
      expect(RETRY_CONFIG.MAX_RETRIES).toBeLessThanOrEqual(5);
      expect(RETRY_CONFIG.MAX_DELAY_MS).toBeGreaterThan(0);
      expect(RETRY_CONFIG.INITIAL_DELAY_MS).toBeGreaterThan(0);
      expect(RETRY_CONFIG.JITTER_FACTOR).toBeGreaterThanOrEqual(0);
      expect(RETRY_CONFIG.JITTER_FACTOR).toBeLessThanOrEqual(1);
      expect(RETRY_CONFIG.MAX_DELAY_MS).toBeGreaterThanOrEqual(
        RETRY_CONFIG.INITIAL_DELAY_MS,
      );
    });
  });
});
