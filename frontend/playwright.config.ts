import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 *
 * Runs comprehensive end-to-end tests against the real frontend and backend.
 * Tests cover: authentication, authorization, CRUD operations, filtering, pagination,
 * error handling, retry behavior, request cancellation, and user journeys.
 */

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:5173";
const API_URL =
  process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";

export default defineConfig({
  testDir: "./e2e/tests",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  testMatch: "**/*.spec.ts",
  fullyParallel: false, // Sequential execution for test data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker to ensure data isolation
  reporter: [
    ["html", { outputFolder: "e2e/reports/html", open: "never" }],
    ["json", { outputFile: "e2e/reports/results.json" }],
    ["junit", { outputFile: "e2e/reports/junit.xml" }],
    ["list"],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      url: "http://localhost:3000/health",
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
    {
      command: "npm run dev",
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
  ],

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
