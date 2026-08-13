import { describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import {
  handleApiError,
  getErrorMessage,
  isValidationError,
  extractValidationErrors,
} from "./errorHandling";

// Mock console.error to avoid noise in tests
vi.spyOn(console, "error").mockImplementation(() => {});

describe("error handling utilities", () => {
  describe("getErrorMessage", () => {
    it("extracts message from API error response", () => {
      const apiError = {
        response: {
          data: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
            },
          },
        },
      };

      expect(getErrorMessage(apiError)).toBe("Validation failed");
    });

    it("handles axios error with message", () => {
      const axiosError = new AxiosError("Network Error");
      expect(getErrorMessage(axiosError)).toBe("Network Error");
    });

    it("handles standard Error objects", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error)).toBe("Something went wrong");
    });

    it("handles string errors", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("provides fallback for unknown error types", () => {
      expect(getErrorMessage({ unknown: "error" })).toBe(
        "An unexpected error occurred",
      );
      expect(getErrorMessage(null)).toBe("An unexpected error occurred");
      expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
    });
  });

  describe("isValidationError", () => {
    it("identifies validation errors", () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
            },
          },
        },
      };

      expect(isValidationError(validationError)).toBe(true);
    });

    it("identifies non-validation errors", () => {
      const authError = {
        response: {
          status: 401,
          data: {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Not authorized",
            },
          },
        },
      };

      expect(isValidationError(authError)).toBe(false);
    });

    it("handles errors without response", () => {
      const networkError = new Error("Network error");
      expect(isValidationError(networkError)).toBe(false);
    });
  });

  describe("extractValidationErrors", () => {
    it("extracts field-specific validation errors", () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              details: {
                email: "Email is required",
                password: "Password must be at least 8 characters",
                name: "Name is too short",
              },
            },
          },
        },
      };

      const errors = extractValidationErrors(validationError);
      expect(errors).toEqual({
        email: "Email is required",
        password: "Password must be at least 8 characters",
        name: "Name is too short",
      });
    });

    it("returns empty object for non-validation errors", () => {
      const authError = {
        response: {
          status: 401,
          data: {
            error: { code: "UNAUTHORIZED", message: "Not authorized" },
          },
        },
      };

      expect(extractValidationErrors(authError)).toEqual({});
    });

    it("handles errors without details", () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
            },
          },
        },
      };

      expect(extractValidationErrors(validationError)).toEqual({});
    });
  });

  describe("handleApiError", () => {
    it("logs errors to console", () => {
      const consoleSpy = vi.spyOn(console, "error");
      const error = new Error("Test error");

      handleApiError(error, "Test operation");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in Test operation:",
        error,
      );
    });

    it("returns formatted error message for validation errors", () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            error: { code: "VALIDATION_ERROR", message: "Validation failed" },
          },
        },
      };

      const result = handleApiError(apiError, "API call");
      expect(result).toBe("Please check the entered information.");
    });

    it("handles network errors", () => {
      const networkError = new AxiosError("Network Error");
      networkError.code = "ECONNREFUSED";

      const result = handleApiError(networkError, "Network request");
      expect(result).toBe("An unexpected error occurred. Please try again.");
    });

    it("provides context in error messages", () => {
      const error = new Error("Generic error");
      const result = handleApiError(error, "User login");

      expect(result).toBe("An unexpected error occurred. Please try again.");
      expect(console.error).toHaveBeenCalledWith("Error in User login:", error);
    });
  });
});
