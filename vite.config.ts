import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/tasks-board/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
