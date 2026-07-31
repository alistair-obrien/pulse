import { defineConfig } from "vite";

export default defineConfig(() => {

    return {
        build: {
            outDir: process.env.VITE_OUT_DIR,
            emptyOutDir: true,
        },

        define: {
            __APP_SOURCE__: JSON.stringify(process.env.VITE_APP_SOURCE ?? "Unknown"),
        },
    };
});