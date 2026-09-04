import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "server-only": path.join(root, "src/test/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    env: {
      DATABASE_URL: "postgres://gaya:gaya@localhost:5432/gaya_nails",
      SMS_DRIVER: "docker",
      SMS_MOCK_URL: "http://localhost:4010",
    },
  },
});
