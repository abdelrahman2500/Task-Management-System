/**
 * Environment Configuration and Validation
 *
 * This module validates all required environment variables at startup.
 * It ensures that:
 * - All required variables are present
 * - Types are correct
 * - Security requirements are met
 * - The application fails fast if configuration is invalid
 */

interface EnvironmentConfig {
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  server: {
    port: number;
    nodeEnv: "development" | "production" | "test";
  };
  cors: {
    origin: string;
  };
  logging: {
    level: string;
  };
}

/**
 * Validate that a string is a strong secret for production.
 * Requirements:
 * - At least 32 characters
 * - Contains uppercase and lowercase letters
 * - Contains numbers and special characters
 * - Not a default/placeholder value
 */
function isStrongSecret(secret: string): boolean {
  if (secret.length < 32) return false;
  if (!/[A-Z]/.test(secret)) return false;
  if (!/[a-z]/.test(secret)) return false;
  if (!/[0-9]/.test(secret)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret)) return false;

  // Reject common placeholder values
  const placeholders = [
    "change-this-to-a-long-random-secret",
    "your-secret-here",
    "secret",
    "password",
    "123456",
    "changeme",
  ];
  const lowerSecret = secret.toLowerCase();
  if (placeholders.some((p) => lowerSecret.includes(p))) return false;

  return true;
}

/**
 * Validate a JWT expiration string.
 * Valid formats: "7d", "24h", "30m", "3600" (seconds)
 */
function isValidJwtExpiration(expires: string): boolean {
  const validPattern = /^(\d+)([smhd])?$/i;
  if (!validPattern.test(expires)) return false;

  const num = parseInt(expires, 10);
  if (isNaN(num) || num <= 0) return false;

  return true;
}

/**
 * Load and validate environment configuration
 * Throws an error if validation fails
 */
export function loadEnvironment(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test";

  const errors: string[] = [];

  // DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push("DATABASE_URL is required");
  } else if (!databaseUrl.startsWith("postgresql://")) {
    errors.push("DATABASE_URL must be a PostgreSQL connection string");
  }

  // JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET is required");
  } else if (nodeEnv === "production") {
    // Production requires strong secrets
    if (!isStrongSecret(jwtSecret)) {
      errors.push(
        "JWT_SECRET is too weak for production. " +
          "Must be at least 32 characters with uppercase, lowercase, numbers, and special characters.",
      );
    }
  }

  // JWT_EXPIRES_IN
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  if (!isValidJwtExpiration(jwtExpiresIn)) {
    errors.push(
      "JWT_EXPIRES_IN has invalid format. Use formats like '7d', '24h', '30m', or '3600'",
    );
  }

  // PORT
  const portStr = process.env.PORT || "3000";
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid number between 1 and 65535");
  }

  // CORS_ORIGIN
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
  if (nodeEnv === "production" && corsOrigin.includes("localhost")) {
    errors.push(
      "CORS_ORIGIN should not use localhost in production. Use your actual domain.",
    );
  }

  // Report all errors at once
  if (errors.length > 0) {
    const errorMessage = [
      "❌ Environment configuration validation failed:",
      ...errors.map((e) => `   • ${e}`),
      "",
      "Please fix the above issues and try again.",
    ].join("\n");

    throw new Error(errorMessage);
  }

  // All validations passed
  return {
    database: {
      url: databaseUrl!,
    },
    jwt: {
      secret: jwtSecret!,
      expiresIn: jwtExpiresIn,
    },
    server: {
      port,
      nodeEnv,
    },
    cors: {
      origin: corsOrigin,
    },
    logging: {
      level:
        process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
    },
  };
}

/**
 * Get the current environment configuration
 * Call this after loadEnvironment() has been called
 */
let cachedConfig: EnvironmentConfig | null = null;

export function getEnvironment(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvironment();
  }
  return cachedConfig;
}

/**
 * Verify JWT configuration at startup
 * This ensures the application has a valid JWT setup before processing requests
 */
export function verifyJwtConfiguration(): void {
  const config = getEnvironment();

  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  if (!config.jwt.expiresIn) {
    throw new Error("JWT_EXPIRES_IN is not configured");
  }

  // Log secure information (only in development)
  if (config.server.nodeEnv === "development") {
    console.log("✓ JWT configuration verified");
    console.log(`  • Algorithm: HS256 (HMAC with SHA-256)`);
    console.log(`  • Expiration: ${config.jwt.expiresIn}`);
  }
}
