import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: "background.js",
        offscreen: "offscreen.js"
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
