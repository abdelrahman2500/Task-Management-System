import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiLimiter } from "./middleware/rateLimiter";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLoggerMiddleware } from "./middleware/requestLogger";
import { logServerStart } from "./lib/logger";
import { getEnvironment } from "./config/environment";
import { buildCompleteOpenAPISpec } from "./config/openapi";

export const app = express();

// Trust proxy when behind a reverse proxy (production deployment)
// This ensures req.ip is correctly extracted from X-Forwarded-For header
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing with size limits
// JSON: 10MB limit to allow reasonable file uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request ID generation (must come before logging)
app.use(requestIdMiddleware);

// Request logging (must come after request ID)
app.use(requestLoggerMiddleware);

// Global rate limiting (general API limit, can be overridden per-route)
app.use(apiLimiter);

// Health check (no rate limiting applied to this endpoint)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// OpenAPI/Swagger documentation endpoint
// Available at http://localhost:3000/docs in development
const openAPISpec = buildCompleteOpenAPISpec();
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openAPISpec, {
    swaggerOptions: {
      url: "/openapi.json",
      persistAuthorization: true,
    },
  }),
);

// Serve OpenAPI spec as JSON
app.get("/openapi.json", (_req, res) => {
  res.json(openAPISpec);
});

// API routes
app.use("/api/v1", router);

// 404 and error handlers — must come last
app.use(notFound);
app.use(errorHandler);

// Log server start after app is configured
const env = getEnvironment();
logServerStart(env.server.port, env.server.nodeEnv);
