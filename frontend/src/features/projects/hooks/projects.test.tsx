import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProjects } from "./useProjects";
import { useCreateProject } from "./useCreateProject";
import { mockAuthUser } from "../../../tests/helpers";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  mockAuthUser(); // Projects require auth
});

describe("useProjects", () => {
  it.skip("fetches projects successfully", () => {
    // Skipped: Requires full MSW/API mocking - see integration tests
    renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });
  });

  it.skip("applies pagination parameters", () => {
    // Skipped: Requires API mocking
  });

  it.skip("applies search filter", () => {
    // Skipped: Requires API mocking
  });
});

describe("useCreateProject", () => {
  it.skip("creates project successfully", () => {
    // Skipped: Requires API mocking
  });

  it.skip("validates required fields", () => {
    // Skipped: Requires API mocking
  });
});
