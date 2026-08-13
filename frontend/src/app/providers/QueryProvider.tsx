import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { setQueryClientReference } from "../../shared/api/axios";
import {
  shouldRetryOnError,
  getRetryDelay,
  shouldRetryMutation,
} from "../../shared/api/retryPolicy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryOnError,
      retryDelay: getRetryDelay,
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      retry: shouldRetryMutation,
    },
  },
});

setQueryClientReference(queryClient);

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
