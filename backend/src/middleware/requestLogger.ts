/**
 * Request Logging Middleware
 *
 * Logs HTTP requests with correlation via request ID.
 * Captures timing and authenticated user information.
 */

import type { Request, Response, NextFunction } from "express";
import { logRequest, logRateLimit } from "../lib/logger";

/**
 * Middleware to log HTTP requests after response is sent
 */
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip logging for health check to reduce noise
  if (req.path === "/health") {
    return next();
  }

  // Capture the original res.end function
  const originalEnd = (res.end as any).bind(res);

  // Override res.end to log after response is finalized
  (res.end as any) = function (...args: any[]) {
    // Calculate request duration
    const durationMs = Date.now() - req.startTime;

    // Extract information for logging
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;
    const userId = (req as any).user?.userId;
    const ip = req.ip;
    const userAgent = req.get("user-agent");

    // Log rate limit responses separately
    if (statusCode === 429) {
      logRateLimit(req.id, method, path, ip, userId);
    } else {
      // Log normal request
      logRequest(
        req.id,
        method,
        path,
        statusCode,
        durationMs,
        userId,
        ip,
        userAgent,
      );
    }

    // Call original end
    return originalEnd(...args);
  };

  next();
}
