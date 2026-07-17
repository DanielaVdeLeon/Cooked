import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    // Make .env.local Supabase vars available to integration tests.
    env: loadEnv(mode, process.cwd(), "NEXT_PUBLIC_"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
}));
