# Natura Wellness frontend test

A responsive frontend prototype for the fictional Natura Wellness brand. The project contains two independent product experiences: a subscription-management flow (Part A) and a product buy box (Part B). The original brief is in [`INSTRUCTIONS.md`](./INSTRUCTIONS.md).

## Live previews

- **Application:** [natura-wellness-frontend-test-hazel.vercel.app](https://natura-wellness-frontend-test-hazel.vercel.app/)
- **Storybook:** [natura-wellness-storybook.vercel.app](https://natura-wellness-storybook.vercel.app/)

## Tech stack

- React 19 and TypeScript 6
- Vite 7 for development and production builds
- Tailwind CSS 4 with themeable CSS design tokens
- Storybook 10 for component stories and design foundations
- Vitest and Testing Library for unit/component tests
- Playwright and axe for browser and accessibility checks
- ESLint, Prettier, and Knip for code quality and unused-code checks
- Node.js 22 and pnpm 10.34.9 (through Corepack)

## Getting started

Requirements: Node.js 22 and Corepack.

```bash
corepack enable
pnpm install
pnpm dev
```

Vite prints the local URL when the server starts. Both experiences are selected by query string rather than separate routes:

| Experience | URL |
|---|---|
| Part A — subscription management | `/?part=a&fixture=active` |
| Part B — product buy box | `/?part=b` |

Part A supports these mock subscription fixtures: `active`, `paused`, `cancelled`, and `error`. Add `&conflict=always` to force a simulated conflict during an update. For example: `/?part=a&fixture=active&conflict=always`.

Part B is matched to [`public/reference/buy-box.png`](./public/reference/buy-box.png), a 2× reference capture at a 1200px viewport. Its copy is kept in [`src/part-b/copy.ts`](./src/part-b/copy.ts); the product image is `public/product.jpg`.

## Theme strategy

The experiences share design-token roles, not a single fixed palette. The theme system is defined in [`src/styles/globals.css`](./src/styles/globals.css):

1. **Primitives** define raw palette values. Components must not use these directly.
2. **Semantic tokens** name reusable roles such as `bg`, `surface`, `muted`, `accent`, and `status-active`. Tailwind utilities are generated from these roles (`bg-surface`, `text-muted`, `border-line`).
3. **Theme scopes** map semantic roles, fonts, typography steps, and radius roles to each visual identity. Switching `data-theme` on a wrapper changes the full subtree.

Part A uses the default **brand** theme (Plus Jakarta Sans, lime/sage and olive). Part B uses **part-b** (Fraunces headings, Inter text, cream and forest green), applied to the application shell when `?part=b` is selected. This keeps Part A's visual system intact while allowing Part B to match its own reference.

In Storybook, use the **Theme** toolbar to switch between `brand` and `part-b`. The Foundations stories document the colors and typography; component stories show shared components and their behavior in each theme.

## Project structure

```text
src/
  app/                 Query-string view selection and shared navigation
  api/                 Provided mock subscription API and fixtures
  content/             Typed UI copy
  part-a/              Subscription-management experience
  part-b/              Product buy box
  shared/              Reusable components, hooks, logic, icons, and utilities
  styles/              Design tokens, theme contract, and foundations stories
.storybook/            Storybook setup and theme selector
e2e/                   Playwright views and browser tests
public/                Product image and visual reference
```

Dependencies flow in one direction: shared kernel (`shared`, `content`, `styles`, `api`) → experiences (`part-a`, `part-b`) → app shell. See [`AGENTS.md`](./AGENTS.md) for the detailed architecture and contribution rules.

## Available commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Build the application for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm storybook` | Start Storybook at `http://localhost:6006` |
| `pnpm build-storybook` | Build the static Storybook site |
| `pnpm test` | Run unit and component tests |
| `pnpm test:watch` | Run unit tests in watch mode |
| `pnpm test:storybook` | Run Storybook story tests in Chromium, including axe checks |
| `pnpm test:e2e` | Run browser smoke and accessibility tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm format` | Format files with Prettier |
| `pnpm format:check` | Check formatting without writing changes |
| `pnpm knip` | Find unused files, exports, and dependencies |
| `pnpm verify` | Run format check, lint, typecheck, unit tests, Knip, app build, and Storybook build |

For the first Playwright run, install Chromium:

```bash
pnpm exec playwright install chromium
```

`pnpm verify` does not run Playwright or the Storybook story tests; run `pnpm test:e2e` and `pnpm test:storybook` separately when validating those surfaces.

## Testing

The browser suite lists every supported view in [`e2e/views.ts`](./e2e/views.ts). Each view is exercised on desktop and at a 375px viewport, with axe accessibility checks and security-header assertions. Add any new query-string view or fixture to that list so it is included in the suite.

Theme contrast is also checked by unit tests against the shared theme contract. Every declared text and UI color pair must meet the project’s WCAG 2.2 AA thresholds in each theme.

## Deployment

Vercel deploys `main` to the live application and Storybook sites. Pull requests receive preview deployments. The project requires no environment variables; response security headers are configured in [`vercel.json`](./vercel.json).
