import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
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
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = "/",
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  // Set the query client reference for axios interceptor
  setQueryClientReference(queryClient);

  // Set initial route
  if (initialRoute !== "/") {
    window.history.pushState({}, "", initialRoute);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
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
  // Mock token storage instead of localStorage directly
  try {
    if (tokenStorage && tokenStorage.setAccessToken) {
      tokenStorage.setAccessToken("mock-jwt-token");
    }
  } catch {
    // Fallback to localStorage
    localStorage.setItem("accessToken", "mock-jwt-token");
  }
}

export function clearAuthUser() {
  // Clear token storage
  try {
    if (tokenStorage && tokenStorage.removeAccessToken) {
      tokenStorage.removeAccessToken();
    }
  } catch {
    // Fallback to localStorage
    localStorage.removeItem("accessToken");
  }
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
