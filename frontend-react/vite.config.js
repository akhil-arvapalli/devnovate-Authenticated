import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.ANCHOR_API_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/chat": { target: API_TARGET, changeOrigin: true },
      "/brief": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
      "/dashboard": { target: API_TARGET, changeOrigin: true },
      "/observations": { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/chat": { target: API_TARGET, changeOrigin: true },
      "/brief": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
      "/dashboard": { target: API_TARGET, changeOrigin: true },
      "/observations": { target: API_TARGET, changeOrigin: true },
    },
  },
});
