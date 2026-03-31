import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const rawBase = process.env.VITE_BASE_PATH;
const base =
  rawBase && rawBase.length > 0
    ? rawBase.endsWith("/")
      ? rawBase
      : `${rawBase}/`
    : "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
