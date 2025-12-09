import { defineConfig, globalIgnores } from "eslint/config";
import { viteConfig } from "@repo/eslint-config/vite";

export default defineConfig([...viteConfig, globalIgnores(["dist"])]);
