import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", generatedRouteTree: "./src/route-tree.gen.ts", autoCodeSplitting: true }),
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
  ],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
