import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loadEnvironment, verifyJwtConfiguration } from "../config/environment";

describe("Security - JWT and Environment", () => {
  // Helper to preserve and restore environment
  const preserveEnv = () => {
    const saved: Record<string, string | undefined> = {};
    return {
      set: (key: string, value: string | undefined) => {
        if (!(key in saved)) saved[key] = process.env[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      },
      restore: () => {
        Object.entries(saved).forEach(([key, value]) => {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        });
      },
    };
  };

  describe("Environment Configuration", () => {
    it("should fail if JWT_SECRET is missing in production", () => {
      const env = preserveEnv();
      env.set("NODE_ENV", "production");
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", undefined);

      expect(() => {
        loadEnvironment();
      }).toThrow(/JWT_SECRET is required/);

      env.restore();
    });

    it("should fail if JWT_SECRET is too weak in production", () => {
      const env = preserveEnv();
      env.set("NODE_ENV", "production");
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "weak-secret");

      expect(() => {
        loadEnvironment();
      }).toThrow(/JWT_SECRET is too weak for production/);

      env.restore();
    });

    it("should allow weak JWT_SECRET in development", () => {
      const env = preserveEnv();
      env.set("NODE_ENV", "development");
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "development-secret");

      expect(() => {
        loadEnvironment();
      }).not.toThrow();

      env.restore();
    });

    it("should fail if DATABASE_URL is missing", () => {
      const env = preserveEnv();
      env.set("DATABASE_URL", undefined);
      env.set("JWT_SECRET", "test-secret-" + "a".repeat(32));

      expect(() => {
        loadEnvironment();
      }).toThrow(/DATABASE_URL is required/);

      env.restore();
    });

    it("should fail if JWT_EXPIRES_IN has invalid format", () => {
      const env = preserveEnv();
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "test-secret-" + "a".repeat(32));
      env.set("JWT_EXPIRES_IN", "invalid");

      expect(() => {
        loadEnvironment();
      }).toThrow(/JWT_EXPIRES_IN has invalid format/);

      env.restore();
    });

    it("should accept valid JWT_EXPIRES_IN formats", () => {
      const env = preserveEnv();
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "test-secret-" + "a".repeat(32));

      const validFormats = ["7d", "24h", "30m", "3600"];

      for (const format of validFormats) {
        env.set("JWT_EXPIRES_IN", format);
        expect(() => {
          loadEnvironment();
        }).not.toThrow();
      }

      env.restore();
    });

    it("should warn if CORS_ORIGIN uses localhost in production", () => {
      const env = preserveEnv();
      env.set("NODE_ENV", "production");
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "strong-secret-" + "a".repeat(32) + "!@#$");
      env.set("CORS_ORIGIN", "http://localhost:3000");

      expect(() => {
        loadEnvironment();
      }).toThrow(/CORS_ORIGIN should not use localhost in production/);

      env.restore();
    });
  });

  describe("JWT Security", () => {
    it("should generate valid JWT with correct algorithm", () => {
      const secret = "test-secret-" + "a".repeat(32);
      const payload = { userId: 1, email: "test@example.com" };

      const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      const decoded = jwt.verify(token, secret) as typeof payload;
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe("test@example.com");
    });

    it("should reject expired JWT", () => {
      const secret = "test-secret-" + "a".repeat(32);
      const payload = { userId: 1, email: "test@example.com" };

      const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "-1s", // Already expired
      });

      expect(() => {
        jwt.verify(token, secret, { algorithms: ["HS256"] });
      }).toThrow();
    });

    it("should reject JWT with invalid signature", () => {
      const secret = "test-secret-" + "a".repeat(32);
      const wrongSecret = "wrong-secret-" + "b".repeat(32);
      const payload = { userId: 1, email: "test@example.com" };

      const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      expect(() => {
        jwt.verify(token, wrongSecret, { algorithms: ["HS256"] });
      }).toThrow();
    });

    it("should reject JWT with manipulated payload", () => {
      const secret = "test-secret-" + "a".repeat(32);
      const payload = { userId: 1, email: "test@example.com" };

      let token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      // Try to modify the token (this will fail verification)
      const parts = token.split(".");
      const manipulated = [parts[0], parts[1], "invalid-signature"].join(".");

      expect(() => {
        jwt.verify(manipulated, secret, { algorithms: ["HS256"] });
      }).toThrow();
    });

    it("should not allow user to change userId in JWT", () => {
      const secret = "test-secret-" + "a".repeat(32);
      const originalPayload = { userId: 1, email: "test@example.com" };

      const token = jwt.sign(originalPayload, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
      });

      // Decode without verification (what a user might try)
      const decoded = jwt.decode(token) as typeof originalPayload;

      // If user tries to modify and re-sign, signature will be invalid
      if (decoded) {
        decoded.userId = 999; // Attacker tries to change user ID
        const forgedToken = jwt.sign(decoded, "wrong-secret", {
          algorithm: "HS256",
        });

        // Original secret won't verify forged token
        expect(() => {
          jwt.verify(forgedToken, secret, { algorithms: ["HS256"] });
        }).toThrow();
      }
    });
  });

  describe("Password Security", () => {
    it("should hash passwords with bcrypt", async () => {
      const password = "MySecurePassword123!";
      const hash = await bcrypt.hash(password, 12);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt format

      const matches = await bcrypt.compare(password, hash);
      expect(matches).toBe(true);
    });

    it("should reject wrong password", async () => {
      const password = "MySecurePassword123!";
      const wrongPassword = "WrongPassword456!";
      const hash = await bcrypt.hash(password, 12);

      const matches = await bcrypt.compare(wrongPassword, hash);
      expect(matches).toBe(false);
    });

    it("should not allow plaintext password comparison", async () => {
      const password = "MySecurePassword123!";
      const hash = await bcrypt.hash(password, 12);

      // Direct comparison fails
      expect(password === hash).toBe(false);
      expect(password).not.toBe(hash);
    });
  });

  describe("JWT Configuration Verification", () => {
    it("should verify JWT configuration without throwing in development", () => {
      const env = preserveEnv();
      env.set("NODE_ENV", "development");
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "test-secret-" + "a".repeat(32));
      env.set("JWT_EXPIRES_IN", "7d");

      expect(() => {
        verifyJwtConfiguration();
      }).not.toThrow();

      env.restore();
    });

    it("should verify all required JWT configs are present", () => {
      const env = preserveEnv();
      env.set("DATABASE_URL", "postgresql://test@localhost/test");
      env.set("JWT_SECRET", "test-secret-" + "a".repeat(32));
      env.set("JWT_EXPIRES_IN", "7d");

      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_EXPIRES_IN).toBeDefined();

      expect(() => {
        verifyJwtConfiguration();
      }).not.toThrow();

      env.restore();
    });
  });
});
