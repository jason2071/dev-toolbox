import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to the Go backend so the UI works fully offline on localhost.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
