import "dotenv/config";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { loadEnvironment, verifyJwtConfiguration } from "./config/environment";

async function main() {
  // Validate environment configuration first
  try {
    const config = loadEnvironment();
    verifyJwtConfiguration();

    // Connect to database
    await prisma.$connect();
    console.log("✓ Database connected");

    // Start server
    app.listen(config.server.port, () => {
      console.log(`✓ Server running on http://localhost:${config.server.port}`);
      if (config.server.nodeEnv === "production") {
        console.log(
          "⚠ Production mode - ensure all security measures are in place",
        );
      }
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
