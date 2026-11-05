import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

// Test-only configuration. Kept out of vite.config.ts so `vite build` never loads Storybook or
// Vitest tooling; Vitest prefers this file over vite.config.ts and merges the app config in.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "jsdom",
            setupFiles: ["./vitest.setup.ts"],
            include: ["src/**/*.test.{ts,tsx}"],
          },
        },
        {
          // Every story, rendered in Chromium: its play function and the a11y check run as a test.
          extends: true,
          plugins: [storybookTest({ configDir: ".storybook" })],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" }],
            },
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  }),
);
