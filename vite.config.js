import { defineConfig } from "vite";

// GitHub Actions supplies the repository subpath; local development uses '/'.
export default defineConfig({ base: process.env.VITE_BASE_PATH || "/" });
