/**
 * Centralized Structured Logger
 *
 * Uses Pino for production-grade JSON logging.
 * Configured for:
 * - Structured JSON output in production
 * - Human-readable output in development
 * - Request correlation via request IDs
 * - Sensitive data redaction
 */

import pino from "pino";
import { getEnvironment } from "../config/environment";

/**
 * Fields that should NEVER be logged (sensitive data)
 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "passwordhash", // lowercase for comparison
  "jwt",
  "token",
  "accesstoken", // lowercase for comparison
  "refreshtoken", // lowercase for comparison
  "secret",
  "authorization",
  "cookie",
]);

/**
 * Headers that should NEVER be logged (sensitive data)
 */
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "x-api-key",
  "x-token",
]);

/**
 * Create the Pino logger instance
 */
function createLogger() {
  const env = getEnvironment();
  const isDevelopment = env.server.nodeEnv === "development";

  if (isDevelopment) {
    // Human-readable format for development
    return pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    });
  }

  // JSON format for production (structured logging)
  return pino({
    level: process.env.LOG_LEVEL || "info",
    base: {
      env: env.server.nodeEnv,
    },
  });
}

export const logger = createLogger();

/**
 * Redact sensitive fields from an object
 */
function redactObject(obj: any, depth = 0): any {
  if (depth > 10) return "[REDACTED - DEEP NESTING]";
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.has(lowerKey)) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactObject(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Redact sensitive headers
 */
function redactHeaders(headers: Record<string, any>): Record<string, any> {
  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Log levels
 */
export const LogLevel = {
  TRACE: "trace",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
} as const;

export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Request log entry
 */
export interface RequestLogEntry {
  timestamp: string;
  requestId: string;
  level: LogLevelType;
  message: string;
  method: string;
  path: string;
  statusCode?: number;
  durationMs?: number;
  userId?: number;
  ip?: string;
  userAgent?: string;
  error?: {
    code: string;
    message: string;
  };
  [key: string]: any;
}

/**
 * Log a successful HTTP request
 */
export function logRequest(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: number,
  ip?: string,
  userAgent?: string,
) {
  const level = statusCode >= 500 ? LogLevel.ERROR : LogLevel.INFO;

  logger[level]({
    requestId,
    method,
    path,
    statusCode,
    durationMs,
    userId,
    ip,
    userAgent,
  });
}

/**
 * Log a validation error (400/422)
 */
export function logValidationError(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  errors: Record<string, string>,
  userId?: number,
  ip?: string,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode,
    durationMs,
    userId,
    ip,
    message: "Validation error",
    errors: redactObject(errors),
  });
}

/**
 * Log an authentication error (401)
 */
export function logAuthError(
  requestId: string,
  method: string,
  path: string,
  reason: string,
  ip?: string,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode: 401,
    message: "Authentication failed",
    reason,
    ip,
  });
}

/**
 * Log an authorization error (403)
 */
export function logAuthorizationError(
  requestId: string,
  method: string,
  path: string,
  userId: number,
  reason: string,
  ip?: string,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode: 403,
    message: "Authorization denied",
    userId,
    reason,
    ip,
  });
}

/**
 * Log a not found error (404)
 */
export function logNotFound(
  requestId: string,
  method: string,
  path: string,
  userId?: number,
  ip?: string,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode: 404,
    message: "Resource not found",
    userId,
    ip,
  });
}

/**
 * Log a conflict error (409)
 */
export function logConflict(
  requestId: string,
  method: string,
  path: string,
  userId: number,
  reason: string,
  ip?: string,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode: 409,
    message: "Resource conflict",
    userId,
    reason,
    ip,
  });
}

/**
 * Log a rate limit error (429)
 */
export function logRateLimit(
  requestId: string,
  method: string,
  path: string,
  ip?: string,
  userId?: number,
) {
  logger.warn({
    requestId,
    method,
    path,
    statusCode: 429,
    message: "Rate limit exceeded",
    ip,
    userId,
  });
}

/**
 * Log an unexpected error (5xx)
 */
export function logError(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  errorCode: string,
  errorMessage: string,
  stack?: string,
  userId?: number,
  ip?: string,
) {
  const data: any = {
    requestId,
    method,
    path,
    statusCode,
    durationMs,
    errorCode,
    message: errorMessage,
    userId,
    ip,
  };

  // Only include stack trace in development
  if (getEnvironment().server.nodeEnv === "development" && stack) {
    data.stack = stack;
  }

  logger.error(data);
}

/**
 * Log server startup event
 */
export function logServerStart(port: number, nodeEnv: string) {
  logger.info({
    message: "Server started",
    port,
    env: nodeEnv,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log database connection success
 */
export function logDatabaseConnected() {
  logger.info({
    message: "Database connection established",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log database connection failure
 */
export function logDatabaseError(error: any) {
  logger.error({
    message: "Database connection failed",
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Export redaction functions for use in other modules
 */
export { redactObject, redactHeaders };
