import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    appDirectory: "src",
    routesDirectory: "src/routes",
    generatedRouteTree: "src/routeTree.gen.ts",
  },
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
  server: {
    preset: "vercel",
  },
});
