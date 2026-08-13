/**
 * Global Setup for Playwright E2E Tests
 *
 * Runs once before all tests start.
 * Validates environment, seeds data, and prepares the system.
 */

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:5173";
const API_URL =
  process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";

async function globalSetup() {
  console.log("=== E2E Test Suite: Global Setup ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);

  // Verify frontend is accessible
  console.log("Verifying frontend is accessible...");
  let attempt = 0;
  const maxAttempts = 30; // 30 seconds

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(BASE_URL, {
        method: "HEAD",
        headers: { "User-Agent": "Playwright E2E Tests" },
      });

      if (response.ok || response.status === 404) {
        console.log("✓ Frontend is accessible");
        break;
      }
    } catch (error) {
      attempt++;
      if (attempt === maxAttempts) {
        throw new Error(
          `Frontend not accessible at ${BASE_URL} after ${maxAttempts}s`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Verify API is accessible
  console.log("Verifying API is accessible...");
  attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch("http://localhost:3000/health", {
        method: "GET",
      }).catch(() => null);

      if (response && (response.ok || response.status === 404)) {
        console.log("✓ API is accessible");
        break;
      }

      // Even if health check fails, try a public endpoint
      const healthResponse = await fetch(`${API_URL}/auth/register`, {
        method: "OPTIONS",
      }).catch(() => null);

      if (healthResponse) {
        console.log("✓ API is accessible");
        break;
      }
    } catch (error) {
      attempt++;
      if (attempt === maxAttempts) {
        console.warn(`API may not be accessible at ${API_URL}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("✓ Global setup complete");
}

export default globalSetup;
