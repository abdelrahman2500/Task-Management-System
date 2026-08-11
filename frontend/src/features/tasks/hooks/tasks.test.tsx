import { describe, it, expect, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
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
  it("fetches tasks successfully", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].title).toBe("Test Task");
  });

  it("applies project filter", async () => {
    const { result } = renderHook(() => useTasks({ projectId: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("applies status filter", async () => {
    const { result } = renderHook(() => useTasks({ status: "TODO" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("applies priority filter", async () => {
    const { result } = renderHook(() => useTasks({ priority: "HIGH" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("applies assignee filter", async () => {
    const { result } = renderHook(() => useTasks({ assigneeId: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useCreateTask", () => {
  it("creates task successfully", async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "New Task",
      description: "A new test task",
      status: "TODO",
      priority: "MEDIUM",
      projectId: 1,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.title).toBe("New Task");
  });

  it("handles task with due date", async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    const dueDate = "2024-12-31";
    result.current.mutate({
      title: "Task with Due Date",
      description: "This task has a due date",
      status: "TODO",
      priority: "HIGH",
      projectId: 1,
      dueDate,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("handles task assignment", async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Assigned Task",
      description: "This task is assigned to someone",
      status: "IN_PROGRESS",
      priority: "LOW",
      projectId: 1,
      assigneeId: 2,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
