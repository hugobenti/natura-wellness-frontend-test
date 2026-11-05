import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
});
