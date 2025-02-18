import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: ".", // Root directory should be the project root (where index.html is)
  base: "/", // Base URL for assets
  build: {
    outDir: "static/assets", // Output assets in the correct Hugo static folder
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets"), // Allows importing assets using "@/"
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "assets/styles/variables";`,
        includePaths: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "assets/styles"),
        ],
      },
    },
  },
});
