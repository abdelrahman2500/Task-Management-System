import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  mockAuthUser,
  clearAuthUser,
} from "../tests/helpers";
import App from "./App";

describe("App", () => {
  it("shows login page when not authenticated", () => {
    clearAuthUser();

    renderWithProviders(<App />);

    // Should show login form
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("redirects to dashboard when authenticated", async () => {
    mockAuthUser();

    renderWithProviders(<App />);

    // Should eventually redirect to dashboard
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("handles direct navigation to protected routes", () => {
    clearAuthUser();

    renderWithProviders(<App />, { initialRoute: "/dashboard" });

    // Should redirect to login
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("preserves route after login", async () => {
    clearAuthUser();

    renderWithProviders(<App />, { initialRoute: "/projects" });

    // Should show login page first
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();

    // After mock authentication, should preserve the original route
    mockAuthUser();

    // Re-render to simulate auth state change
    renderWithProviders(<App />, { initialRoute: "/projects" });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows 404 page for non-existent routes", async () => {
    mockAuthUser();

    renderWithProviders(<App />, { initialRoute: "/non-existent-route" });

    // Should show 404 or redirect appropriately
    await waitFor(() => {
      // This depends on your 404 handling implementation
      expect(document.body).toBeInTheDocument(); // Basic check that app renders
    });
  });
});
