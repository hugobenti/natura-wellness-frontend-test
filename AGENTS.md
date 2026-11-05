# AGENTS.md

Guide for AI coding agents (and humans) working in this repo. Read it before changing anything.

## What this is

Natura Wellness frontend test: two builds for a fictional supplement brand, specified in [`INSTRUCTIONS.md`](./INSTRUCTIONS.md) (the brief; never edit it).

- **Part A:** the "Manage my subscription" page, `src/part-a/SubscriptionCard.tsx`, over the mock API in `src/api`. Mobile first (375px).
- **Part B:** the buy box in `public/reference/buy-box.png` (2x screenshot of a 1200px window), rebuilt pixel-close in `src/part-b/BuyBox.tsx` with the copy in `src/part-b/copy.ts`.

Vite, React, TypeScript and Tailwind CSS v4. Deployed on Vercel from `main`; every PR gets a preview deployment.

## Repo map

```
src/main.tsx          entry: mounts <App /> into index.html and loads the global styles
src/app               app shell: picks the part from ?part=a|b, renders the nav
src/part-a            Part A (the brief fixes this path and SubscriptionCard.tsx)
src/part-b            Part B (the brief fixes this path, BuyBox.tsx and copy.ts)
src/shared            shared kernel: UI primitives, hooks, utils
src/content           all UI copy, typed
src/styles            tokens (globals.css, themeContract.ts), theme reader (themeTokens.ts), contrast pairs and test
src/api               the brief's mock backend; given, kept byte-identical
e2e                   Playwright smoke + accessibility tests over every view in e2e/views.ts
```

Views are query strings, not routes: `?part=a&fixture=active|paused|cancelled|error` (add `&conflict=always` to force the 409), and `?part=b`.

Dependencies flow one way: **kernel (shared, content, styles, api) → parts → app**.

## Rules

- **Boundary:** the kernel may not import a part or `src/app`; a part may not import another part or `src/app`. What both parts need moves to `src/shared` (or `src/content` for copy). ESLint generates the rule for every `src/part-*` folder, and CI fails on a violation. Do not disable the rule; move the code instead.
- **The brief's files are fixed.** Never edit `INSTRUCTIONS.md` or `src/api` (it's the given backend: lint and Prettier skip it, `tsc` still checks it). Build on its exports; anything the API doesn't offer is simulated in local state. Keep the paths the brief names.
- **No third-party UI kit.** Build components in `src/shared/components` (primitives) or the part's `components/`. Behavior-only libraries are fine.
- **Every `.tsx` component is presentation only.** It renders props and what its hook returns: no logic, no data, no class strings. ESLint fails the build on helper functions, arithmetic, template formatting, array manipulation, module-level data, effects or browser APIs in a component file (`presentation/no-restricted-syntax`). Full rule: "Component architecture" below. `src/main.tsx` is the only exception: it's the entry point, not a component.
- **Types live in `X.type.ts`.** Every `interface` and `type` goes in a `.type.ts` file next to the file that uses it (`Button.tsx` → `Button.type.ts`); tests may keep local types. Interfaces start with `I` (`IUser`), type aliases with `T` (`TButtonProps`). ESLint enforces both. The API's own types (`Subscription`, `CatalogProduct`…) keep their given names.
- **Token-only styling.** `src/styles/globals.css` layers primitives (`--brand-*` on `:root`) → semantic tokens (`@theme static`) → `[data-theme]` blocks. Style files never use primitives, only the utilities the semantic tokens generate (`bg-surface`, `text-muted`, `font-heading`…). Semantic tokens are the theme contract: a new one goes in `@theme`, in every `[data-theme]` block, in `src/styles/themeContract.ts` and, if it carries text or UI, in `src/styles/contrastPairs.ts` (checked by `tokenContrast.test.ts`). Themes switch via `data-theme` on a wrapper; Part B will get its own theme there later. Light only, no dark mode. Fonts are `font-sans` and `font-heading`; sizes are only `text-title`, `text-section`, `text-body`, `text-small`, `text-eyebrow`. Tailwind's default palette is removed and `design-tokens/no-raw-color` fails on raw palette classes and color literals.
- **Status colors** always come with their icon and word, never color alone.
- **Accessibility is a requirement:** semantic HTML, an accessible name on every control, visible focus (`focus-visible`), WCAG 2.2 AA contrast for every token pair (tested per theme), keyboard access, and `prefers-reduced-motion` honored (opacity fades only). `jsx-a11y` strict rules run in lint; axe runs on every view in `pnpm test:e2e`.
- **No scroll-jacking:** never `preventDefault` wheel, touch or keyboard scrolling.
- **Copy:** all text lives in `src/content` (labels, headings, `aria-label`s); Part B's given copy stays in `src/part-b/copy.ts`. ESLint fails on text in markup.
- **New view or fixture:** add its URL to `e2e/views.ts`; the e2e suite then loads it on desktop and at 375px and runs axe on it.
- **Security headers** are declared once in `vercel.json`; `vite preview` (and so the e2e suite) serves the same ones.

## Component architecture

Each concern has its own kind of file. A component file never mixes them.

- **`X.tsx` is presentation only.** It maps props and hook results to markup: JSX, destructuring, `.map` over ready-made arrays, simple conditionals on given values (`status === "done"`, `index > 0`), and `cx()` for classes. Nothing else: no helper functions, arithmetic, template formatting, array manipulation (`filter`, `sort`, `join`…), module-level data, effects, timers, observers or `window` / `document` / `navigator`.
- **`useX.ts` is behavior and derived data.** State, effects, browser APIs, timers, and the view model the markup needs. It never returns JSX. A generic behavior hook is named after what it does (`useDisclosure`) and composed by the component's own hook.
- **Pure logic** that needs no React (price math, date formatting, state transitions) goes in a plain `.ts` module (`src/part-*/logic`) with its own unit test; hooks call it.
- **`X.data.ts`** holds static data a component renders (option lists, presets). UI copy lives in `src/content`.
- **`X.type.ts`** holds every type and interface, next to the file that uses it.

## Styling architecture

Markup and styling never share a file.

- **`X.style.ts` owns every class.** It exports one plain object per component: `base` for the classes every instance gets, one key per variant mapping each option to its classes, and named keys for other parts. No logic: values are plain strings, or `cx()` over strings and shared pieces. `.join()` and template literals fail ESLint, so Tailwind always sees every class literally.
- **`X.tsx` composes classes with `cx()`** (`src/shared/utils/cx.ts`): `cx(button.base, button.variant[variant], className)`. A class string in `className` (literal, template, or inside a call/conditional) fails ESLint.
- **Variants are declared once.** Prop types come from the style object (`variant?: keyof typeof button.variant`). Defaults live in the component's props.
- **Callers extend, never override.** A component accepts `className` and passes it last to `cx()`; use it for layout, not to restyle internals.

## Commands

| Command             | What it does                                                              |
| ------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`          | Vite dev server                                                           |
| `pnpm build`        | production build into `dist`                                              |
| `pnpm preview`      | serves `dist` with the production security headers                        |
| `pnpm lint`         | ESLint (boundary, component, style-file, copy, token and a11y rules)      |
| `pnpm typecheck`    | `tsc --noEmit`                                                            |
| `pnpm test`         | Vitest + Testing Library                                                  |
| `pnpm test:e2e`     | Playwright: isolated production build, every view on desktop + 375px, axe |
| `pnpm knip`         | unused files, exports and dependencies                                    |
| `pnpm format`       | Prettier; also sorts Tailwind classes, inside `cx()` too                  |
| `pnpm format:check` | Prettier check (CI)                                                       |
| `pnpm verify`       | everything CI's `check` job runs, building into `.dist-verify`            |

## Workflow

Never commit to `main`; GitHub rejects it. Each stage of work gets its own branch (`feat/<name>`, `fix/<name>`, `refactor/<name>`, `chore/<name>`), stays small (≤ ~20 files) and lands through a pull request that Hugo reviews and squash-merges; the `check` and `e2e` CI jobs must be green. Fill in the PR template. Write the failing test first for anything with logic; run `pnpm verify` and `pnpm test:e2e` before asking for review. Check UI changes on the PR's Vercel preview at 375px and at 1200px.

Dependabot opens grouped dependency PRs weekly. Review them like any other PR; CI decides.

**Verifying a production build while Hugo works:** never build into `dist` while he may be previewing it. `pnpm verify` builds into `.dist-verify` and `pnpm test:e2e` into `.dist-e2e`; for a manual check, `pnpm build --outDir .dist-verify --emptyOutDir && pnpm preview --outDir .dist-verify --port <port>`.
