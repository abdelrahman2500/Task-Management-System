import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from "./validation";

describe("validation utilities", () => {
  describe("validateEmail", () => {
    it("accepts valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(validateEmail("user123@subdomain.domain.com")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("not-an-email")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@domain")).toBe(false);
      expect(validateEmail("user name@domain.com")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("accepts valid passwords", () => {
      expect(validatePassword("Password123!")).toBe(true);
      expect(validatePassword("MyP@ssw0rd")).toBe(true);
      expect(validatePassword("Str0ng#Pass")).toBe(true);
    });

    it("rejects passwords that are too short", () => {
      expect(validatePassword("Pw1!")).toBe(false);
      expect(validatePassword("Short1!")).toBe(false);
    });

    it("rejects passwords without uppercase letters", () => {
      expect(validatePassword("lowercase123!")).toBe(false);
      expect(validatePassword("no-upper-case-1!")).toBe(false);
    });

    it("rejects passwords without lowercase letters", () => {
      expect(validatePassword("UPPERCASE123!")).toBe(false);
      expect(validatePassword("NO-LOWER-CASE-1!")).toBe(false);
    });

    it("rejects passwords without numbers", () => {
      expect(validatePassword("NoNumbers!")).toBe(false);
      expect(validatePassword("Password!")).toBe(false);
    });

    it("rejects passwords without special characters", () => {
      expect(validatePassword("Password123")).toBe(false);
      expect(validatePassword("NoSpecialChar1")).toBe(false);
    });
  });

  describe("validateRequired", () => {
    it("accepts non-empty values", () => {
      expect(validateRequired("value")).toBe(true);
      expect(validateRequired("0")).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it("rejects empty values", () => {
      expect(validateRequired("")).toBe(false);
      expect(validateRequired("   ")).toBe(false); // whitespace only
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe("validateMinLength", () => {
    it("accepts strings meeting minimum length", () => {
      expect(validateMinLength("hello", 3)).toBe(true);
      expect(validateMinLength("hello", 5)).toBe(true);
      expect(validateMinLength("hello world", 10)).toBe(true);
    });

    it("rejects strings below minimum length", () => {
      expect(validateMinLength("hi", 3)).toBe(false);
      expect(validateMinLength("", 1)).toBe(false);
      expect(validateMinLength("short", 10)).toBe(false);
    });

    it("handles edge cases", () => {
      expect(validateMinLength("", 0)).toBe(true);
      expect(validateMinLength("a", 1)).toBe(true);
    });
  });

  describe("validateMaxLength", () => {
    it("accepts strings within maximum length", () => {
      expect(validateMaxLength("hello", 10)).toBe(true);
      expect(validateMaxLength("hello", 5)).toBe(true);
      expect(validateMaxLength("", 5)).toBe(true);
    });

    it("rejects strings exceeding maximum length", () => {
      expect(validateMaxLength("hello world", 5)).toBe(false);
      expect(validateMaxLength("too long", 3)).toBe(false);
    });

    it("handles edge cases", () => {
      expect(validateMaxLength("", 0)).toBe(true);
      expect(validateMaxLength("a", 1)).toBe(true);
      expect(validateMaxLength("ab", 1)).toBe(false);
    });
  });
});
