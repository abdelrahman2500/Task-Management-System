import { rateLimit } from "express-rate-limit";
import type { Request } from "express";

/**
 * Rate limiting middleware with multiple preset policies
 *
 * Key Strategy:
 * - For authenticated users: "user:<userId>:ip:<ip>"
 * - For unauthenticated: "ip:<ip>"
 * - For auth endpoints: "auth:ip:<ip>"
 */

/**
 * Helper to get key for rate limiting
 * Authenticated users are rate-limited per user + IP
 * Unauthenticated requests are rate-limited per IP only
 */
function getRateLimitKey(req: Request, prefix: string = ""): string {
  const ip = req.ip || "unknown";
  const userId = (req as any).user?.userId;

  if (userId) {
    return `${prefix ? prefix + ":" : ""}user:${userId}:ip:${ip}`;
  }

  return `${prefix ? prefix + ":" : ""}ip:${ip}`;
}

/**
 * General API rate limiter
 * - Authenticated users: 200 requests per 15 minutes
 * - Used for most API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  keyGenerator: (req) => getRateLimitKey(req),
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    });
  },
});

/**
 * Auth rate limiter (stricter)
 * - 5 attempts per 15 minutes per IP
 * - Used for login and register endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator: (req) => getRateLimitKey(req, "auth"),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many auth attempts, please try again later.",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please try again in 15 minutes.",
      },
    });
  },
});

/**
 * Write operations rate limiter (stricter than general)
 * - 100 requests per 15 minutes per authenticated user
 * - Used for POST, PUT, PATCH, DELETE operations
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: (req) => getRateLimitKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many write requests, please try again later.",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    });
  },
});

/**
 * Read operations rate limiter (more generous)
 * - 500 requests per 15 minutes per authenticated user
 * - Used for GET operations
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  keyGenerator: (req) => getRateLimitKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many read requests, please try again later.",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    });
  },
});

/**
 * Loose rate limiter for public endpoints
 * - 50 requests per minute per IP
 */
export const looseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  keyGenerator: (req) => getRateLimitKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    });
  },
});
