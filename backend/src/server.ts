import "dotenv/config";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { loadEnvironment, verifyJwtConfiguration } from "./config/environment";

let server: any = null;
let isShuttingDown = false;

/**
 * Graceful shutdown handler
 * Stops accepting new requests, waits for active requests, closes database
 */
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n📋 ${signal} received. Starting graceful shutdown...`);

  // Step 1: Stop accepting new requests
  if (server) {
    server.close(async () => {
      console.log("✓ Server closed (no new requests)");

      // Step 2: Close database connection
      try {
        await prisma.$disconnect();
        console.log("✓ Database disconnected");
      } catch (err) {
        console.error("❌ Error disconnecting database:", err);
      }

      // Step 3: Exit process
      console.log("✓ Graceful shutdown complete");
      process.exit(0);
    });

    // Timeout after 30 seconds - force exit
    const shutdownTimeout = setTimeout(() => {
      console.error("⚠️  Graceful shutdown timeout. Force exiting.");
      process.exit(1);
    }, 30000);

    // Clear timeout if shutdown completes early
    process.on("exit", () => clearTimeout(shutdownTimeout));
  } else {
    // Server wasn't even started
    try {
      await prisma.$disconnect();
    } catch (err) {
      // Ignore
    }
    process.exit(0);
  }
}

async function main() {
  // Validate environment configuration first
  try {
    const config = loadEnvironment();
    verifyJwtConfiguration();

    // Connect to database
    await prisma.$connect();
    console.log("✓ Database connected");

    // Start server
    server = app.listen(config.server.port, () => {
      console.log(`✓ Server running on http://localhost:${config.server.port}`);
      if (config.server.nodeEnv === "production") {
        console.log(
          "⚠️  Production mode - ensure all security measures are in place",
        );
      }
    });

    // Handle graceful shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (err) {
    console.error(
      "❌ Failed to start server:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
}

main();
