/**
 * Global Teardown for Playwright E2E Tests
 *
 * Runs once after all tests complete.
 * Cleans up any lingering resources.
 */

async function globalTeardown() {
  console.log("=== E2E Test Suite: Global Teardown ===");
  console.log("✓ Tests complete");
}

export default globalTeardown;
