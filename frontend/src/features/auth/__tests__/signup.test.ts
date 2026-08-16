import { describe, it, expect } from "vitest";
import { signupSchema } from "../schemas/signup.schema";

describe("SignupForm Validation Schema", () => {
  it("should validate a complete valid signup form", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePassword123!",
      confirmPassword: "SecurePassword123!",
    };

    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("Name Field Validation", () => {
    it("should reject empty name", () => {
      const result = signupSchema.safeParse({
        name: "",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const result = signupSchema.safeParse({
        name: "A",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 50 characters", () => {
      const result = signupSchema.safeParse({
        name: "A".repeat(51),
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should accept name with exactly 2 characters", () => {
      const result = signupSchema.safeParse({
        name: "AB",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("should accept name with spaces", () => {
      const result = signupSchema.safeParse({
        name: "John Doe Smith",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from name", () => {
      const result = signupSchema.safeParse({
        name: "  John Doe  ",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
      }
    });
  });

  describe("Email Field Validation", () => {
    it("should reject empty email", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "invalid",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject email without domain", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid email", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("should accept email with subdomain", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@mail.example.co.uk",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Password Field Validation", () => {
    it("should reject empty password", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should accept password with exactly 8 characters", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "12345678",
        confirmPassword: "12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should accept long password", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "A".repeat(100),
        confirmPassword: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Confirm Password Field Validation", () => {
    it("should reject empty confirm password", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject mismatched passwords", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "Different123!",
      });
      expect(result.success).toBe(false);
    });

    it("should accept matching passwords", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Extra Fields", () => {
    it("should ignore extra fields like role (only backend validates)", () => {
      // Frontend Zod schema doesn't use .strict(), only backend does
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        role: "admin",
      });
      // Frontend passes, backend will reject
      expect(result.success).toBe(true);
    });

    it("should ignore isAdmin field (only backend validates)", () => {
      // Frontend Zod schema doesn't use .strict(), only backend does
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        isAdmin: true,
      });
      // Frontend passes, backend will reject
      expect(result.success).toBe(true);
    });

    it("should ignore unknown fields (only backend validates)", () => {
      // Frontend Zod schema doesn't use .strict(), only backend does
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        unknownField: "value",
      });
      // Frontend passes, backend will reject
      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in name", () => {
      const result = signupSchema.safeParse({
        name: "John O'Doe-Smith",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("should handle numeric password", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "12345678",
        confirmPassword: "12345678",
      });
      expect(result.success).toBe(true);
    });

    it("should handle special characters in password", () => {
      const result = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "!@#$%^&*()",
        confirmPassword: "!@#$%^&*()",
      });
      expect(result.success).toBe(true);
    });
  });
});
