import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
});
