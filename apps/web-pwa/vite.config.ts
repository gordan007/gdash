import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "gdash",
        short_name: "gdash",
        description: "Local project health and costs dashboard",
        theme_color: "#111827",
        background_color: "#f8f9fa",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/logo.png", sizes: "675x675", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,md}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@gdash/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@gdash/connectors": path.resolve(__dirname, "../../packages/connectors/src/index.ts"),
      "@gdash/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
    },
  },
  publicDir: path.resolve(__dirname, "../../services-docs"),
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
});
