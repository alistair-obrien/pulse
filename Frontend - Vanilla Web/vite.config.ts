import { defineConfig } from "vite";

export default defineConfig(() => ({
    build: {
        outDir: process.env.VITE_OUT_DIR ?? "../publish/client/undefined",
        emptyOutDir: true,
    },
}));