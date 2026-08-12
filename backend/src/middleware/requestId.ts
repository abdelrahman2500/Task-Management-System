/**
 * Request ID Middleware
 *
 * Generates a unique request ID for every HTTP request.
 * If the application is behind a load balancer, can reuse X-Request-ID header.
 *
 * Request ID is:
 * - Generated as UUID v4 if not provided
 * - Included in all logs for this request
 * - Returned in response headers
 * - Available to subsequent middleware via req.id
 */

import { v4 as uuidv4 } from "uuid";
import type { Request, Response, NextFunction } from "express";

/**
 * Validate that a string is a valid UUID v4
 */
function isValidUUID(str: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(str);
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
}

/**
 * Request ID middleware
 *
 * Generates or reuses request ID and attaches it to the request object.
 * Also records request start time for duration calculation.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Try to reuse X-Request-ID header if provided (trusted from load balancer)
  // Only trust it if it's a valid UUID to prevent injection
  const headerRequestId = req.get("X-Request-ID");
  const requestId =
    headerRequestId && isValidUUID(headerRequestId)
      ? headerRequestId
      : uuidv4();

  // Attach to request for use in subsequent middleware
  req.id = requestId;
  req.startTime = Date.now();

  // Set response header
  res.setHeader("X-Request-ID", requestId);

  next();
}
