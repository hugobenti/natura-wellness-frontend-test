import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import vercel from "./vercel.json" with { type: "json" };

// Security headers are declared once, in vercel.json (production). `vite preview`, which the e2e
// suite runs against, serves the same ones. Only directives that need no script inventory: a
// `script-src` would need hashes for Vite's module preload. The `/iframe.html` rule is Storybook's
// framing exception; the app itself is never framable, so preview takes the other rule.
const appRule = vercel.headers.find((rule) => rule.source !== "/iframe.html");
const securityHeaders = Object.fromEntries(
  (appRule?.headers ?? []).map((header) => [header.key, header.value]),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  preview: { headers: securityHeaders },
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
});
