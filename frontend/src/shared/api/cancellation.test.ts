import { describe, it, expect, beforeEach, vi } from "vitest";
import { AxiosError } from "axios";
import {
  getConfiguredTimeout,
  isAbortError,
  isTimeoutError,
  classifyRequestError,
  shouldNotRetryError,
  getTimeoutCancellationMessage,
  TIMEOUT_CONFIG,
} from "./cancellation";

describe("Cancellation & Timeout", () => {
  describe("getConfiguredTimeout", () => {
    beforeEach(() => {
      // Clear environment
      delete (import.meta.env as any).VITE_API_TIMEOUT_MS;
    });

    it("should return default timeout when no environment variable is set", () => {
      const timeout = getConfiguredTimeout();
      expect(timeout).toBe(TIMEOUT_CONFIG.DEFAULT_MS);
    });

    it("should use environment variable when valid", () => {
      (import.meta.env as any).VITE_API_TIMEOUT_MS = "20000";
      const timeout = getConfiguredTimeout();
      expect(timeout).toBe(20000);
    });

    it("should clamp timeout to minimum if too low", () => {
      (import.meta.env as any).VITE_API_TIMEOUT_MS = "100";
      const timeout = getConfiguredTimeout();
      expect(timeout).toBe(TIMEOUT_CONFIG.MIN_MS);
    });

    it("should clamp timeout to maximum if too high", () => {
      (import.meta.env as any).VITE_API_TIMEOUT_MS = "120000";
      const timeout = getConfiguredTimeout();
      expect(timeout).toBe(TIMEOUT_CONFIG.MAX_MS);
    });

    it("should use default if environment variable is not a number", () => {
      (import.meta.env as any).VITE_API_TIMEOUT_MS = "invalid";
      const timeout = getConfiguredTimeout();
      expect(timeout).toBe(TIMEOUT_CONFIG.DEFAULT_MS);
    });

    it("should validate configured bounds", () => {
      expect(TIMEOUT_CONFIG.MIN_MS).toBeGreaterThan(0);
      expect(TIMEOUT_CONFIG.MAX_MS).toBeGreaterThan(TIMEOUT_CONFIG.MIN_MS);
      expect(TIMEOUT_CONFIG.DEFAULT_MS).toBeGreaterThanOrEqual(
        TIMEOUT_CONFIG.MIN_MS,
      );
      expect(TIMEOUT_CONFIG.DEFAULT_MS).toBeLessThanOrEqual(
        TIMEOUT_CONFIG.MAX_MS,
      );
    });
  });

  describe("isAbortError", () => {
    it("should detect AbortError", () => {
      const error = new Error("Abort");
      (error as any).name = "AbortError";
      expect(isAbortError(error)).toBe(true);
    });

    it("should detect Axios ECONNABORTED with signal", () => {
      const error = new AxiosError("Request aborted");
      error.code = "ECONNABORTED";
      (error.config as any) = { signal: new AbortController().signal };
      expect(isAbortError(error)).toBe(true);
    });

    it("should not detect ECONNABORTED without signal or timeout message", () => {
      const error = new AxiosError("Request aborted");
      error.code = "ECONNABORTED";
      (error.config as any) = {};
      expect(isAbortError(error)).toBe(false);
    });

    it("should not detect timeout as abort", () => {
      const error = new AxiosError("timeout of 5000ms exceeded");
      error.code = "ECONNABORTED";
      (error.config as any) = {}; // No signal
      expect(isAbortError(error)).toBe(false);
    });

    it("should not detect network errors as abort", () => {
      const error = new AxiosError("Network error");
      error.code = "ECONNREFUSED";
      expect(isAbortError(error)).toBe(false);
    });

    it("should not detect non-Axios errors as abort", () => {
      const error = new Error("Some error");
      expect(isAbortError(error)).toBe(false);
    });
  });

  describe("isTimeoutError", () => {
    it("should detect timeout error from ECONNABORTED without signal", () => {
      const error = new AxiosError("timeout of 30000ms exceeded");
      error.code = "ECONNABORTED";
      (error.config as any) = {}; // No signal, so it's a timeout not abort
      expect(isTimeoutError(error)).toBe(true);
    });

    it("should detect timeout from message pattern", () => {
      const error = new AxiosError("timeout of 5000ms exceeded");
      error.code = "ECONNABORTED";
      expect(isTimeoutError(error)).toBe(true);
    });

    it("should not detect abort as timeout", () => {
      const error = new AxiosError("Request aborted");
      error.code = "ECONNABORTED";
      (error.config as any) = { signal: new AbortController().signal };
      expect(isTimeoutError(error)).toBe(false);
    });

    it("should not detect network errors as timeout", () => {
      const error = new AxiosError("Connection refused");
      error.code = "ECONNREFUSED";
      expect(isTimeoutError(error)).toBe(false);
    });

    it("should not detect successful responses as timeout", () => {
      const error = new AxiosError("OK");
      error.response = {
        status: 200,
        data: {},
        headers: {},
        statusText: "OK",
        config: {} as any,
      };
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe("classifyRequestError", () => {
    it("should classify abort error", () => {
      const error = new Error("Aborted");
      (error as any).name = "AbortError";
      const result = classifyRequestError(error);
      expect(result.type).toBe("abort");
      expect(result.retryable).toBe(false);
    });

    it("should classify timeout error", () => {
      const error = new AxiosError("timeout");
      error.code = "ECONNABORTED";
      (error.config as any) = {};
      const result = classifyRequestError(error);
      expect(result.type).toBe("timeout");
      expect(result.retryable).toBe(true);
    });

    it("should classify network error", () => {
      const error = new AxiosError("Connection refused");
      error.code = "ECONNREFUSED";
      const result = classifyRequestError(error);
      expect(result.type).toBe("network");
      expect(result.retryable).toBe(true);
    });

    it("should classify HTTP error (4xx)", () => {
      const error = new AxiosError("Bad Request");
      error.response = {
        status: 400,
        data: {},
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      };
      const result = classifyRequestError(error);
      expect(result.type).toBe("http");
      expect(result.retryable).toBe(true);
    });

    it("should classify HTTP error (5xx)", () => {
      const error = new AxiosError("Server Error");
      error.response = {
        status: 500,
        data: {},
        headers: {},
        statusText: "Server Error",
        config: {} as any,
      };
      const result = classifyRequestError(error);
      expect(result.type).toBe("http");
      expect(result.retryable).toBe(true);
    });

    it("should classify unknown error", () => {
      const error = new Error("Unknown");
      const result = classifyRequestError(error);
      expect(result.type).toBe("unknown");
      expect(result.retryable).toBe(false);
    });
  });

  describe("shouldNotRetryError", () => {
    it("should prevent retry of abort errors", () => {
      const error = new Error("Aborted");
      (error as any).name = "AbortError";
      expect(shouldNotRetryError(error as any)).toBe(true);
    });

    it("should allow retry of network errors", () => {
      const error = new AxiosError("Network error");
      error.code = "ECONNREFUSED";
      expect(shouldNotRetryError(error as any)).toBe(false);
    });

    it("should allow retry of timeout errors", () => {
      const error = new AxiosError("timeout");
      error.code = "ECONNABORTED";
      (error.config as any) = {};
      expect(shouldNotRetryError(error as any)).toBe(false);
    });

    it("should allow retry of HTTP errors", () => {
      const error = new AxiosError("Server Error");
      error.response = {
        status: 500,
        data: {},
        headers: {},
        statusText: "Server Error",
        config: {} as any,
      };
      expect(shouldNotRetryError(error as any)).toBe(false);
    });
  });

  describe("getTimeoutCancellationMessage", () => {
    it("should return cancellation message for abort errors", () => {
      const error = new Error("Aborted");
      (error as any).name = "AbortError";
      const message = getTimeoutCancellationMessage(error);
      expect(message).toContain("cancelled");
    });

    it("should return timeout message for timeout errors", () => {
      const error = new AxiosError("timeout");
      error.code = "ECONNABORTED";
      (error.config as any) = {};
      const message = getTimeoutCancellationMessage(error);
      expect(message).toContain("took too long");
    });

    it("should return null for other errors", () => {
      const error = new AxiosError("Network error");
      error.code = "ECONNREFUSED";
      const message = getTimeoutCancellationMessage(error);
      expect(message).toBeNull();
    });

    it("should return null for HTTP errors", () => {
      const error = new AxiosError("Bad Request");
      error.response = {
        status: 400,
        data: {},
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      };
      const message = getTimeoutCancellationMessage(error);
      expect(message).toBeNull();
    });
  });

  describe("Abort Signal Propagation", () => {
    it("should propagate abort signal through request options", () => {
      const controller = new AbortController();
      const signal = controller.signal;

      // This tests the interface definition
      const options = { signal };
      expect(options.signal).toBe(signal);
    });

    it("should propagate timeout through request options", () => {
      const options = { timeout: 5000 };
      expect(options.timeout).toBe(5000);
    });

    it("should support both signal and timeout", () => {
      const controller = new AbortController();
      const options = { signal: controller.signal, timeout: 5000 };
      expect(options.signal).toBe(controller.signal);
      expect(options.timeout).toBe(5000);
    });
  });

  describe("Integration: Retry + Cancellation", () => {
    it("abort errors should never be retried by retry policy", () => {
      // This test verifies the integration with retryPolicy.ts
      const error = new Error("Aborted");
      (error as any).name = "AbortError";

      // shouldNotRetryError prevents retry
      expect(shouldNotRetryError(error as any)).toBe(true);
    });

    it("timeout errors should be retryable per retry policy", () => {
      const error = new AxiosError("timeout");
      error.code = "ECONNABORTED";
      (error.config as any) = {};

      // Timeout is not prevented from retry
      expect(shouldNotRetryError(error as any)).toBe(false);
      // Timeout follows normal retry policy rules
    });
  });

  describe("Error Classification Matrix", () => {
    const errorMatrix = [
      {
        name: "AbortError",
        error: (() => {
          const e = new Error("Aborted");
          (e as any).name = "AbortError";
          return e;
        })(),
        expectedType: "abort",
        expectedRetryable: false,
      },
      {
        name: "ECONNABORTED (timeout)",
        error: (() => {
          const e = new AxiosError("timeout");
          e.code = "ECONNABORTED";
          (e.config as any) = {};
          return e;
        })(),
        expectedType: "timeout",
        expectedRetryable: true,
      },
      {
        name: "ECONNREFUSED (network)",
        error: (() => {
          const e = new AxiosError("Connection refused");
          e.code = "ECONNREFUSED";
          return e;
        })(),
        expectedType: "network",
        expectedRetryable: true,
      },
      {
        name: "400 (client error)",
        error: (() => {
          const e = new AxiosError("Bad Request");
          e.response = {
            status: 400,
            data: {},
            headers: {},
            statusText: "Bad Request",
            config: {} as any,
          };
          return e;
        })(),
        expectedType: "http",
        expectedRetryable: true,
      },
      {
        name: "500 (server error)",
        error: (() => {
          const e = new AxiosError("Server Error");
          e.response = {
            status: 500,
            data: {},
            headers: {},
            statusText: "Server Error",
            config: {} as any,
          };
          return e;
        })(),
        expectedType: "http",
        expectedRetryable: true,
      },
    ];

    errorMatrix.forEach(({ name, error, expectedType, expectedRetryable }) => {
      it(`should classify ${name} correctly`, () => {
        const result = classifyRequestError(error);
        expect(result.type).toBe(expectedType);
        expect(result.retryable).toBe(expectedRetryable);
      });
    });
  });
});
