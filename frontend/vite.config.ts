import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    exclude: ["node_modules", "dist", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
