import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import router from "../router";
import { queryClient } from "./providers/QueryProvider";

/**
 * App is the self-contained application root.
 *
 * It owns:
 *  - The QueryClient (shared singleton from QueryProvider)
 *  - The React Router v7 RouterProvider
 *  - The global toast notification layer
 *
 * main.tsx simply mounts <App /> into the DOM.
 * Tests can import and render <App /> directly.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
