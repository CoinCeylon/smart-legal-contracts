import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "unihack-frontend-app.bravebeach-45fb38c2.centralus.azurecontainerapps.io",
      ".azurecontainerapps.io", // Allow all Azure Container Apps domains
    ],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      stream: "stream-browserify",
      util: "util",
    },
  },
  define: {
    global: "globalThis",
  },
  // Add PDF support
  assetsInclude: ["**/*.pdf"],
  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "util",
      "@meshsdk/core",
      "@meshsdk/react",
      // Add react-pdf dependencies
      "react-pdf",
      "pdfjs-dist",
    ],
    exclude: [],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          blockchain: ["@meshsdk/core", "@meshsdk/react"],
        },
      },
    },
  },
}));