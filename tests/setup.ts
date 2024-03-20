// Before your tests or in a setup file
import { vi } from "vitest";

// Mock the entire pino module
vi.mock("pino", () => {
    // Return a simplified logger for testing
    return {
        default: () => ({
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            // Add any other methods you use
        }),
    };
});
