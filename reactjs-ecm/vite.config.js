import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle SPA routing for Cypress
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If the request is for a file (has extension) or API, continue normally
          if (
            req.url.includes(".") ||
            req.url.startsWith("/api/") ||
            req.url.startsWith("/@") ||
            req.url.startsWith("/node_modules/")
          ) {
            return next();
          }

          // For SPA routes, serve index.html
          if (
            req.url.startsWith("/product/") ||
            req.url.startsWith("/cart") ||
            req.url.startsWith("/checkout") ||
            req.url.startsWith("/user/") ||
            req.url.startsWith("/order-") ||
            req.url.startsWith("/admin/") ||
            req.url.startsWith("/change-password/") ||
            req.url.startsWith("/shipping")
          ) {
            req.url = "/";
          }

          next();
        });
      },
    },
  ],
  server: {
    cors: true,
    host: true,
    port: 5173,
    // Handle client-side routing
    proxy: {
      // Proxy API calls to backend
      "/api": {
        target: "http://localhost:6006",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    cors: true,
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@headlessui/react", "react-icons"],
          charts: ["recharts", "chart.js", "react-chartjs-2"],
          utils: ["axios", "date-fns", "zod"],
        },
      },
    },
    // Increase chunk size limit
    chunkSizeWarningLimit: 1000,
  },
  // Define aliases if needed
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios", "date-fns"],
  },
});
