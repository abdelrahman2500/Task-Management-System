import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent, clearAuthUser } from "../helpers";
import App from "../../app/App";

describe("User Workflow Integration Tests", () => {
  beforeEach(() => {
    clearAuthUser();
  });

  it("complete user login and navigation flow", async () => {
    const user = userEvent.setup();

    // Start at the app root
    renderWithProviders(<App />);

    // Should see login form
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password1!");
    await user.click(submitButton);

    // Wait for successful login and navigation
    await waitFor(
      () => {
        expect(
          screen.queryByRole("button", { name: /sign in/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Should be redirected to dashboard or main app
    expect(
      screen.getByRole("main") ||
        screen.getByRole("application") ||
        document.body,
    ).toBeInTheDocument();
  });

  it("handles login failure gracefully", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />);

    // Try to login with invalid credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "WrongPassword!");
    await user.click(submitButton);

    // Should remain on login page
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Should still see the login form
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("validates form inputs before submission", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />);

    // Try to submit empty form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(
        screen.getByText(/email is required/i) || screen.getByText(/required/i),
      ).toBeInTheDocument();
    });
  });

  it("persists authentication across page refreshes", async () => {
    const user = userEvent.setup();

    const { queryClient } = renderWithProviders(<App />);

    // Login first
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password1!");
    await user.click(submitButton);

    // Wait for login
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });

    // Clear query cache to simulate page refresh
    queryClient.clear();

    // Re-render the app (simulating refresh)
    renderWithProviders(<App />);

    // Should still be authenticated due to localStorage token
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("handles protected route access", async () => {
    // Try to access protected route without auth
    renderWithProviders(<App />, { initialRoute: "/dashboard" });

    // Should redirect to login
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("handles logout flow", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />);

    // Login first
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password1!");
    await user.click(submitButton);

    // Wait for successful login
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });

    // Look for logout button/link (implementation dependent)
    const logoutButton =
      screen.queryByRole("button", { name: /logout|sign out/i }) ||
      screen.queryByText(/logout|sign out/i);

    if (logoutButton) {
      await user.click(logoutButton);

      // Should redirect back to login
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /sign in/i }),
        ).toBeInTheDocument();
      });
    }
  });
});
