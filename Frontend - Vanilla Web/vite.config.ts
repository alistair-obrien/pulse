import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
    build: {
        outDir: `../publish/web/${mode.toLowerCase()}`,
        emptyOutDir: true,
    },
}));