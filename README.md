# Natura Wellness frontend test

Natura Wellness is a fictional brand made up for this test. The full brief is in `INSTRUCTIONS.md`.

Live: https://natura-wellness-frontend-test-hazel.vercel.app

Storybook: https://natura-wellness-storybook.vercel.app

Vite, React, TypeScript and Tailwind CSS. Rules for contributors and AI agents live in
[`AGENTS.md`](./AGENTS.md); read it before changing anything.

## Getting started

Requires Node 22 (`.nvmrc`) and Corepack, which provides the pinned pnpm version.

```bash
corepack enable
pnpm install
pnpm dev
```

- **Part A:** `src/part-a/SubscriptionCard.tsx`. Open `/?part=a&fixture=active`. The mock API is in `src/api/`; switch cases with `?fixture=active|paused|cancelled|error` and force the "changed elsewhere" error with `&conflict=always`. Other products are in `catalog` in `src/api/fixtures.ts`.
- **Part B:** `src/part-b/BuyBox.tsx`. Open `/?part=b`. Match `public/reference/buy-box.png`, which is a 2x screenshot of a 1200px-wide browser window. Copy is in `src/part-b/copy.ts`; Fraunces and Inter are loaded in `index.html`.

## Checks

`pnpm verify` runs what CI's `check` job runs (format, lint, typecheck, unit tests, unused-code scan,
isolated production build). `pnpm test:e2e` runs the Playwright suite: every view in `e2e/views.ts` on
desktop and at 375px, with an axe accessibility scan on each, plus the security headers. The first run
needs `pnpm exec playwright install chromium`.

Storybook (design foundations: colors, typography, themes): `pnpm storybook` serves it on :6006,
`pnpm build-storybook` writes the static site to `storybook-static`, and `pnpm test:storybook` runs
every story in Chromium with axe.

## Deploying

Vercel deploys `main` to production and every pull request to a preview URL. There are no environment
variables. Security headers live in `vercel.json`.

## Contributing

`main` is protected: work on a branch, open a pull request, and squash-merge once the `check` and `e2e`
jobs are green
