/**
 * Vitest global setup file
 *
 * Configures global test environment:
 * - DOM polyfills (localStorage, sessionStorage)
 * - Global test utilities
 * - Mock server setup for HTTP requests
 */

import { vi, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";

/**
 * Mock storage implementation for Node.js environment
 */
class MockStorage implements Storage {
  private data: Record<string, string> = {};

  clear(): void {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  setItem(key: string, value: string): void {
    this.data[key] = String(value);
  }

  get length(): number {
    return Object.keys(this.data).length;
  }
}

/**
 * Setup global localStorage and sessionStorage
 */
if (typeof localStorage === "undefined") {
  (global as any).localStorage = new MockStorage();
}

if (typeof sessionStorage === "undefined") {
  (global as any).sessionStorage = new MockStorage();
}

/**
 * Mock server handlers for HTTP requests
 */
export const handlers = [
  // Default handler for axios tests
  http.get("http://localhost:3000/api/v1/test", () => {
    return HttpResponse.json({ message: "Hello World" });
  }),

  // 401 handler for error tests
  http.get("http://localhost:3000/api/v1/test-401", () => {
    return new HttpResponse(null, { status: 401 });
  }),

  // 400 validation error handler
  http.get("http://localhost:3000/api/v1/test-validation", () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: {
            email: ["Email is required"],
            name: ["Name is too short"],
            password: ["Password must be at least 8 characters"],
          },
        },
      },
      { status: 400 },
    );
  }),

  // API error handler
  http.get("http://localhost:3000/api/v1/test-error", () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "API Error",
        },
      },
      { status: 400 },
    );
  }),
];

/**
 * Setup mock server
 */
export const server = setupServer(...handlers);

// Enable request interception before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Disable request interception after all tests
afterAll(() => server.close());

// Reset handlers between tests
afterEach(() => server.resetHandlers());

/**
 * Suppress console output in tests unless explicitly needed
 */
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
};
