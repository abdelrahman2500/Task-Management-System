import { useCallback, useRef } from "react";

/**
 * useDebouncedMutation - Hook to prevent duplicate mutation submissions
 *
 * Prevents accidental double-clicks or rapid submissions by debouncing
 * the mutation trigger. This complements the Button's disabled state.
 *
 * @param mutationFn - The mutation function to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Debounced mutation function
 *
 * @example
 * const createProject = useCreateProject();
 * const debouncedMutate = useDebouncedMutation(createProject.mutate, 300);
 *
 * <button onClick={() => debouncedMutate(data)}>
 *   {createProject.isPending ? "Creating..." : "Create"}
 * </button>
 */
export function useDebouncedMutation<T extends (...args: any[]) => any>(
  mutationFn: T,
  delayMs: number = 300,
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  const debouncedFn = useCallback(
    ((...args: Parameters<T>) => {
      // If already processing, ignore the call
      if (isProcessingRef.current) {
        return;
      }

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Mark as processing
      isProcessingRef.current = true;

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        mutationFn(...args);
        isProcessingRef.current = false;
      }, delayMs);
    }) as T,
    [mutationFn, delayMs],
  );

  return debouncedFn;
}
