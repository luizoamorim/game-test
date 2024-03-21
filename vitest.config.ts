import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./tests/setup.ts"], // If you have any global setup file
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
    },
});
