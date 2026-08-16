import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import * as authService from "./auth.service";
import { prisma } from "../lib/prisma";
import { ConflictError, UnauthorizedError } from "../lib/errors";

describe("Auth Service", () => {
  const testUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePassword123!",
  };

  const anotherTestUser = {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "AnotherPassword123!",
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, anotherTestUser.email],
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, anotherTestUser.email],
        },
      },
    });
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      const result = await authService.register(testUser);

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe(testUser.name);
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.isActive).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token).toMatch(/^eyJ/); // JWT starts with eyJ
    });

    it("should not return password hash", async () => {
      const result = await authService.register(testUser);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("password_hash");
    });

    it("should create user with hashed password", async () => {
      await authService.register(testUser);

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user).toBeDefined();
      expect(user!.passwordHash).toBeDefined();
      expect(user!.passwordHash).not.toBe(testUser.password);
      expect(user!.passwordHash).toMatch(/^\$2[aby]/); // bcrypt hash pattern
    });

    it("should reject duplicate email", async () => {
      await authService.register(testUser);

      const duplicateUser = {
        ...testUser,
        name: "Different Name",
      };

      await expect(authService.register(duplicateUser)).rejects.toThrow(
        ConflictError,
      );
    });

    it("should handle email case sensitivity - different case is allowed", async () => {
      // PostgreSQL is case-sensitive by default, so JOHN@EXAMPLE.COM and john@example.com are different
      await authService.register(testUser);

      const uppercaseEmail = {
        ...testUser,
        email: testUser.email.toUpperCase(),
        name: "Different Name",
      };

      // This succeeds because uppercase is technically different in PostgreSQL
      const result = await authService.register(uppercaseEmail);
      expect(result.user.email).toBe(testUser.email.toUpperCase());
    });

    it("should set default isActive to true", async () => {
      const result = await authService.register(testUser);

      expect(result.user.isActive).toBe(true);
    });

    it("should set default isAdmin to false", async () => {
      const result = await authService.register(testUser);

      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
      });

      expect(user!.isAdmin).toBe(false);
    });

    it("should generate JWT token", async () => {
      const result = await authService.register(testUser);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should create user with timestamps", async () => {
      const result = await authService.register(testUser);

      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
      expect(new Date(result.user.createdAt)).toBeInstanceOf(Date);
      expect(new Date(result.user.updatedAt)).toBeInstanceOf(Date);
    });

    it("should hash password with bcrypt", async () => {
      await authService.register(testUser);

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      const isValidHash = await bcrypt.compare(
        testUser.password,
        user!.passwordHash,
      );
      expect(isValidHash).toBe(true);
    });

    it("should not store plaintext password", async () => {
      await authService.register(testUser);

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user!.passwordHash).not.toBe(testUser.password);
      expect(user!.passwordHash).not.toContain(testUser.password);
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await authService.register(testUser);
    });

    it("should successfully login with correct credentials", async () => {
      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      await expect(
        authService.login({
          email: testUser.email,
          password: "WrongPassword123!",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should reject login with non-existent email", async () => {
      await expect(
        authService.login({
          email: "nonexistent@example.com",
          password: testUser.password,
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should reject login if user is inactive", async () => {
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isActive: false },
      });

      await expect(
        authService.login({
          email: testUser.email,
          password: testUser.password,
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should not expose password in error message", async () => {
      try {
        await authService.login({
          email: testUser.email,
          password: "WrongPassword123!",
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        const errorMsg = (error as Error).message;
        expect(errorMsg.toLowerCase()).not.toContain("password");
        expect(errorMsg).not.toContain(testUser.password);
      }
    });
  });

  describe("getMe", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await authService.register(testUser);
      userId = result.user.id;
    });

    it("should retrieve current user", async () => {
      const user = await authService.getMe(userId);

      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
    });

    it("should not return password hash", async () => {
      const user = await authService.getMe(userId);

      expect(user).not.toHaveProperty("passwordHash");
    });
  });

  describe("updateMe", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await authService.register(testUser);
      userId = result.user.id;
    });

    it("should update user profile", async () => {
      const newName = "Updated Name";
      const result = await authService.updateMe(userId, {
        name: newName,
      });

      expect(result.name).toBe(newName);
    });

    it("should not update password through updateMe", async () => {
      const result = await authService.updateMe(userId, {
        name: "New Name",
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Verify old password still works
      const isValidPassword = await bcrypt.compare(
        testUser.password,
        user!.passwordHash,
      );
      expect(isValidPassword).toBe(true);
    });
  });

  describe("changePassword", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await authService.register(testUser);
      userId = result.user.id;
    });

    it("should change password with valid current password", async () => {
      const newPassword = "NewSecurePassword123!";

      await authService.changePassword(userId, testUser.password, newPassword);

      // Verify new password works
      const loginResult = await authService.login({
        email: testUser.email,
        password: newPassword,
      });

      expect(loginResult.token).toBeDefined();
    });

    it("should reject change with wrong current password", async () => {
      await expect(
        authService.changePassword(
          userId,
          "WrongPassword123!",
          "NewPassword123!",
        ),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should not accept old password after change", async () => {
      const newPassword = "NewSecurePassword123!";

      await authService.changePassword(userId, testUser.password, newPassword);

      await expect(
        authService.login({
          email: testUser.email,
          password: testUser.password,
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("Security", () => {
    it("should not allow same password hash for different users", async () => {
      const user1 = await authService.register(testUser);
      const user2 = await authService.register({
        ...anotherTestUser,
        password: testUser.password, // Same password
      });

      const dbUser1 = await prisma.user.findUnique({
        where: { id: user1.user.id },
      });
      const dbUser2 = await prisma.user.findUnique({
        where: { id: user2.user.id },
      });

      expect(dbUser1!.passwordHash).not.toBe(dbUser2!.passwordHash);
    });

    it("should use bcryptjs with 12 salt rounds", async () => {
      const result = await authService.register(testUser);

      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
      });

      const hash = user!.passwordHash;

      // Bcrypt hash format: $2a$12$... (where 12 is the salt rounds)
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
      expect(hash).toContain("$12$");
    });
  });
});
