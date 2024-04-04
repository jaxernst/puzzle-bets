import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

/** @type {import('vite').Plugin} */
const viteHeaderPlugin = {
  name: "add headers",
  configureServer: (server) => {
    server.middlewares.use((req, res, next) => {
      res.setHeader(
        "Cross-Origin-Opener-Policy",
        "same-origin, same-origin-allow-popups"
      );
      next();
    });
  },
};

export default defineConfig({
  plugins: [viteHeaderPlugin, sveltekit()],
});
