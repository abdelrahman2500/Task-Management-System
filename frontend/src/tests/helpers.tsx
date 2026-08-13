import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { setQueryClientReference } from "../shared/api/axios";
import { tokenStorage } from "../shared/utils/token-storage";

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  initialRoute?: string;
  skipRouter?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = "/",
    skipRouter = false,
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  // Set the query client reference for axios interceptor
  setQueryClientReference(queryClient);

  // Set initial route if needed and not skipping router
  if (!skipRouter && initialRoute !== "/") {
    window.history.pushState({}, "", initialRoute);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    // If the UI component (like App) already provides routing, don't wrap in router
    if (skipRouter) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      );
    }

    // For component tests, provide routing wrapper
    const { BrowserRouter } = require("react-router-dom");
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Auth helpers
export function mockAuthUser() {
  // Set localStorage directly (now available via polyfill in setup.ts)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("accessToken", "mock-jwt-token");
  }
}

export function clearAuthUser() {
  // Clear localStorage
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("accessToken");
  }
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
