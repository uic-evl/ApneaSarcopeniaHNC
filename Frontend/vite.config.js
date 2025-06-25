/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@src", replacement: resolve(__dirname, "src") },
      { find: "@features", replacement: resolve(__dirname, "src/features") },
    ],
  },
  server: {
    proxy: {
      // proxy any /api/fitbit/* request to Fitbit's API
      "/api/fitbit": {
        target: "https://api.fitbit.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/fitbit/, ""),
      },
    },
  },
});
