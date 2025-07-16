import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: { outDir: "build" },
  define: {
    global: "globalThis",
    // Polyfill process.env for compatibility
    "process.env": "import.meta.env",
  },
});
