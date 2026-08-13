import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasks } from "./useTasks";
import { useCreateTask } from "./useCreateTask";
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
  mockAuthUser(); // Tasks require auth
});

describe("useTasks", () => {
  it.skip("fetches tasks successfully", () => {
    // Skipped: Requires full MSW/API mocking - see integration tests
    renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });
  });

  it.skip("applies project filter", () => {
    // Skipped: Requires API mocking
    renderHook(() => useTasks({ projectId: 1 }), {
      wrapper: createWrapper(),
    });
  });

  it.skip("applies status filter", () => {
    // Skipped: Requires API mocking
    renderHook(() => useTasks({ status: "todo" }), {
      wrapper: createWrapper(),
    });
  });

  it.skip("applies priority filter", () => {
    // Skipped: Requires API mocking
  });

  it.skip("applies assignee filter", () => {
    // Skipped: Requires API mocking
  });
});

describe("useCreateTask", () => {
  it.skip("creates task successfully", () => {
    // Skipped: Requires API mocking
  });

  it.skip("handles task with due date", () => {
    // Skipped: Requires API mocking
  });

  it.skip("handles task assignment", () => {
    // Skipped: Requires API mocking
  });
});
