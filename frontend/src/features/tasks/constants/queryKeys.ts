import type { GetTasksParams } from "../types";

/**
 * Hierarchical query key factory for tasks.
 *
 * Structure (from broadest → most specific):
 *
 *   taskKeys.all           → ["tasks"]
 *   taskKeys.lists()       → ["tasks", "list"]
 *   taskKeys.list(params)  → ["tasks", "list", { ...params }]
 *   taskKeys.details()     → ["tasks", "detail"]
 *   taskKeys.detail(taskId)    → ["tasks", "detail", taskId]
 *
 * Why hierarchical?
 * TanStack Query matches keys by prefix — so invalidating `taskKeys.lists()`
 * will automatically bust every filtered list cache, while
 * `taskKeys.all` is a nuclear option that clears every task-related query.
 *
 * Usage examples:
 *   queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
 *     → invalidates ALL list queries (any filters)
 *
 *   queryClient.invalidateQueries({ queryKey: taskKeys.detail(42) })
 *     → invalidates only the cache for task #42
 *
 *   queryClient.invalidateQueries({ queryKey: taskKeys.all })
 *     → nuclear: clears every task query (lists + details)
 */
export const taskKeys = {
  /** Root key — parent of every task-related query. */
  all: ["tasks"] as const,

  /** Parent of all list queries (any filter combination). */
  lists: () => [...taskKeys.all, "list"] as const,

  /**
   * Specific filtered list.
   * Params are spread into the key so different filter combos get
   * their own cache slot while still sharing the "list" prefix.
   */
  list: (params: GetTasksParams) => [...taskKeys.lists(), params] as const,

  /** Parent of all detail queries (any task taskId). */
  details: () => [...taskKeys.all, "detail"] as const,

  /** Specific task by taskId. */
  detail: (taskId: number) => [...taskKeys.details(), taskId] as const,
} as const;
