# Brand Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Quiet sage" brand (colors, Plus Jakarta Sans type scale) as themeable tokens, then document it in a Storybook whose accessibility check fails CI and which deploys to its own Vercel project.

**Architecture:**

- **Theme blocks:** `src/styles/globals.css` holds everything.
  - Primitives are plain `:root` custom properties (`--brand-*`), so they generate no utilities.
  - Semantic tokens live in `@theme static` and point at primitives with `var()`; this is the default (brand) theme.
  - Any other theme is a `[data-theme="<name>"]` block that redefines every semantic token.
- **Shared reader:** a pure reader, `readThemes()`, parses that CSS. The contrast test and the Storybook pages both use it, so docs and tests read the same values the app ships.
- **Storybook:** runs on `@storybook/react-vite`. `@storybook/addon-vitest` runs every story in Vitest browser mode with `a11y.test: "error"`.

**Tech Stack:** Vite 7, React 19, TypeScript 6, Tailwind v4, Vitest 5.1, Storybook 10.6.x, Playwright Chromium, pnpm 10.34.9.

**Spec:** `docs/superpowers/specs/2026-11-05-brand-foundations-design.md` (approved). Token values, contrast pairs, type scale and theme mechanism are specified there; read it before starting any task.

## Global Constraints

- Node 22, pnpm 10.34.9 via Corepack (`corepack pnpm …`). ESLint stays on 9, Vite on 7, TypeScript `~6.0.0`, Vitest 5.1.
- Storybook packages pinned to the same 10.6.x: `storybook`, `@storybook/react-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`; plus `@vitest/browser-playwright` 5.x.
- Never edit `INSTRUCTIONS.md` or `src/api/**`. Never commit to `main`.
- All AGENTS.md rules hold for app code:
  - presentation-only `.tsx`
  - classes in `X.style.ts` via `cx()`
  - types in `X.type.ts` with `I`/`T` prefixes
  - copy in `src/content`
  - token-only colors
  - kernel (`shared`, `content`, `styles`) never imports `part-*` or `app`
- Light only: no `prefers-color-scheme: dark` anywhere.
- No icon library: icons are inline SVG.
- Fonts: Plus Jakarta Sans 400/500/600/700 from Google Fonts. Fraunces and Inter stay loaded for Part B.
- Before each commit: `corepack pnpm verify` exits 0. Before each PR: `corepack pnpm test:e2e` exits 0, and from Task 3 on, `corepack pnpm test:storybook` exits 0 too.

## Review Focus

1. **A theme that leaves out a token:** with CSS cascading, it silently inherits the brand value. The completeness test must fail when any `[data-theme]` block misses a semantic color or font role (Task 1).
2. **A subtree with `data-theme`:** its text color and font must re-resolve, not keep the values inherited from `body`. The `ThemeScope` play test proves it in a real browser (Task 3).
3. **`var()` chains and dangling references:** chains resolve; a missing variable throws an error naming it, never returns `""` (Task 1).
4. **UI-only contrast pairs (3:1) in the Color page's contrast table:** these must not be previewed as text, or axe fails on the docs. Render them as a border or shape (Task 4).
5. **Framing headers:** the app's `/` keeps `X-Frame-Options: DENY`; only `/iframe.html` is frameable by the same origin. The e2e header test plus a check of the deployed Storybook cover it (Task 6).

---

## PR 1: `feat/brand-tokens` (branch exists, stacked on `chore/house-setup`)

### Task 1: Theme reader, brand tokens, theme-aware contrast test

**Files:**

- Create:
  - `src/styles/themeTokens.ts`, `src/styles/themeTokens.type.ts`
  - `src/styles/themeContract.ts`
  - `src/styles/contrastPairs.ts`, `src/styles/contrastPairs.type.ts`
  - `src/styles/themes.ts`, `src/styles/themes.type.ts`
  - `src/styles/themeTokens.test.ts`
- Modify:
  - `src/styles/globals.css`: full rewrite of the token blocks
  - `src/styles/tokenContrast.test.ts`
  - `src/shared/utils/colorContrast.ts`: keep only `contrastRatio` and its luminance helper; delete `readThemeColors` and `readDarkColors`
  - `src/app/App.style.ts`: `text-[13px]` → `text-small`

**Interfaces:**

- Produces:
  - `readThemes(css: string): ITheme[]`, with `ITheme = { name: string; colors: Record<string, string>; fonts: Record<string, string>; primitives: Record<string, string>; declared: string[] }`.
    - **`name`:** `"brand"` for the `@theme` + `:root` layer, then one entry per `[data-theme="x"]` block, in source order.
    - **`colors`:** keyed without the `--color-` prefix; `fonts` without `--font-`. Every value is resolved to its final literal: hex for colors, the family list for fonts.
    - **`primitives`:** the theme's own non-semantic custom properties (brand: `--brand-*` → hex), keyed by full name.
    - **`declared`:** semantic names (`bg`, `font:sans`…) the block itself declares. Brand counts as declaring everything in `@theme`.
    - **Non-brand themes:** start from brand's resolved values, then apply their own declarations.
    - **Ignored and failing input:** wildcard resets (`--color-*: initial`, `--text-*: initial`) are skipped. An unresolvable `var(--x)` throws `Error` with `--x` in the message; the `var(--x, fallback)` form is unsupported and also throws. Developer errors may use `// eslint-disable-next-line no-restricted-syntax -- developer error` like the existing code.
  - `semanticColorTokens: readonly string[]`: all 21 color names from the spec's semantic table (`bg`, `surface`, `line`, `control-line`, `fg`, `muted`, `accent`, `accent-hover`, `on-accent`, `focus`, `fill-soft`, `fill-selected`, `decor`, and `status-{active,paused,cancelled,danger}` with their `on-status-*` partners). `fontRoles: readonly ["sans", "heading"]`. Both in `themeContract.ts`.
  - `contrastPairs: readonly IContrastPair[]` with `IContrastPair = { fg: string; bg: string; kind: "text" | "ui" }`, holding exactly the spec's "Contrast pairs to test" list. `minimumRatio(kind)` returns 4.5 for text and 3 for ui.
  - `themeNames = ["brand"] as const` and `TThemeName = (typeof themeNames)[number]` (the type goes in `themes.type.ts`).

- [ ] **Step 1: Write the failing reader tests** in `src/styles/themeTokens.test.ts` against a fixture CSS string (not `globals.css`):
  - `resolves semantic colors through primitives`: `@theme static { --color-*: initial; --color-bg: var(--p-a); --font-sans: "X", sans-serif; } :root { --p-a: #ffffff; }` gives `brand.colors.bg === "#ffffff"`, `brand.fonts.sans === '"X", sans-serif'` and `brand.primitives["--p-a"] === "#ffffff"`.
  - `a data-theme block overrides brand and reports what it declares`: adding `[data-theme="alt"] { --p-b: #000000; --color-bg: var(--p-b); }` gives `themes.map(t => t.name)` of `["brand", "alt"]`, `alt.colors.bg` of `"#000000"`, and `alt.declared` that contains `"bg"` but not `"font:sans"`.
  - `follows var() chains`: `--a: var(--b); --b: var(--c); --c: #123456` resolves to `#123456`.
  - `throws on a dangling var()`: `toThrow(/--missing/)`.
- [ ] **Step 2: Run `corepack pnpm vitest run src/styles/themeTokens.test.ts`.** Expected: FAIL, module not found.
- [ ] **Step 3: Implement `readThemes` in `src/styles/themeTokens.ts`** with regex parsing in the style of the existing `colorContrast.ts`. Blocks have no nesting.
- [ ] **Step 4: Rerun.** Expected: 4 PASS.
- [ ] **Step 5: Rewrite `tokenContrast.test.ts`** to run over `readThemes(globals.css)`:
  - `describe.each(themes)`: every `contrastPairs` entry meets `minimumRatio(kind)` (use `contrastRatio` from `@/shared/utils/colorContrast`).
  - `every theme declares the full contract`: each non-brand theme's `declared` ⊇ every `semanticColorTokens` entry plus `font:sans` and `font:heading`, and brand's resolved `colors`/`fonts` contain them all.
  - `the theme picker lists every theme`: `themes.map(t => t.name)` equals `[...themeNames]`.
- [ ] **Step 6: Run `corepack pnpm test`.** Expected: FAIL, missing tokens such as `control-line` and `status-active`.
- [ ] **Step 7: Rewrite the token blocks of `globals.css`** from the spec tables:
  - **Primitives:** a `:root` block of the 18 primitives named `--brand-<primitive>` (e.g. `--brand-lime-50: #f7f9ee`).
  - **`@theme static`:** `--color-*: initial`, the 21 semantic colors as `var(--brand-…)`, and the radii unchanged.
  - **Fonts and type scale:** a second `@theme` with:
    - `--font-sans` and `--font-heading`, both `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`
    - `--text-*: initial`
    - the five steps `title`/`section`/`body`/`small`/`eyebrow`, each with `--text-<step>`, `--text-<step>--line-height`, `--text-<step>--letter-spacing` and `--text-<step>--font-weight` at the spec's values
  - **Removed:** the dark `@media` block and `--font-display`.
  - **Base layer:** `body` uses `font-sans` and `text-body`. `h1, h2` get `font-family: var(--font-heading)`. Add a `[data-theme]` rule setting `color: var(--color-fg); font-family: var(--font-sans);`, which is how a subtree re-resolves.
  - **Header comment:** rewritten to describe primitives → semantic → `[data-theme]` blocks.
- [ ] **Step 8: Run `corepack pnpm verify`.** Expected: exit 0, all contrast tests passing for `brand`.
- [ ] **Step 9: Commit:** `git add src/styles src/shared/utils/colorContrast.ts src/app/App.style.ts && git commit -m "feat: quiet sage brand tokens with themeable contract"`

### Task 2: Load the brand font, update the agent docs, open PR 1

**Files:**

- Modify: `index.html`, `AGENTS.md`, `.github/pull_request_template.md`
- Add (already written; commit them): `docs/superpowers/specs/2026-11-05-brand-foundations-design.md`, `docs/superpowers/plans/2026-11-05-brand-foundations.md`

**Interfaces:**

- Consumes: Task 1's tokens.

- [ ] **Step 1: Add the font to `index.html`.** Put `family=Plus+Jakarta+Sans:wght@400;500;600;700` into the existing Google Fonts URL; keep Fraunces and Inter, and keep `display=swap`.
- [ ] **Step 2: Update `AGENTS.md`.**
  - **Repo map:** `src/styles` = tokens, theme reader, contrast test.
  - **Token-only styling rule:** primitives (`--brand-*`) are never used by style files. Semantic tokens are the theme contract, so a new one goes in `@theme`, in every `[data-theme]` block, in `themeContract.ts` and, if it carries text or UI, in `contrastPairs.ts`. Themes switch via `data-theme` on a wrapper. Light only, no dark mode. Fonts are `font-sans`/`font-heading`; sizes are only `text-title|section|body|small|eyebrow`. Replace the stale `font-display` example and the sentence about sampling Part B colors.
  - **Status colors:** always come with their icon and word.
- [ ] **Step 3: Update the PR template.** The contrast checklist line points at `src/styles/contrastPairs.ts`.
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:e2e`. Expected: both exit 0, 12 e2e tests pass.
- [ ] **Step 5: Commit:** `git add index.html AGENTS.md .github docs && git commit -m "docs: brand foundations design, plan and token rules"`

_(Controller: smoke-check `pnpm dev` at 375px, then push and open PR 1 against `chore/house-setup`.)_

---

## PR 2: `feat/storybook` (branch from `feat/brand-tokens`)

### Task 3: Storybook with the a11y gate, theme picker and ThemeScope check

**Files:**

- Create:
  - `.storybook/main.ts`, `.storybook/preview.tsx`, `.storybook/preview.style.ts`, `.storybook/preview-head.html`, `.storybook/vitest.setup.ts`
  - `src/styles/foundations/Introduction.mdx`
  - `src/styles/foundations/ThemeScope.stories.tsx`
- Modify:
  - `package.json`: deps and scripts
  - `vite.config.ts`: `test.projects`
  - `eslint.config.mjs`, `knip.jsonc`, `.gitignore`, `.prettierignore`
  - `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: `themeNames` from `src/styles/themes.ts`.
- Produces: the preview decorator wraps every story in `<div data-theme={globals.theme} className={storyCanvas}>`, with `storyCanvas = "min-h-24 bg-bg p-8 font-sans text-body text-fg"`. The theme toolbar global is `theme`, default `"brand"`, with items from `themeNames`. Tasks 4 and 5 read the active theme from `context.globals.theme`.

- [ ] **Step 1: Install** `storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y @storybook/addon-vitest` at the same 10.6.x, plus `@vitest/browser-playwright@^5`, as devDependencies.
- [ ] **Step 2: Configure Storybook.**
  - **`main.ts`:** stories `../src/**/*.mdx` and `../src/**/*.stories.@(ts|tsx)`; addons docs, a11y and vitest; framework `@storybook/react-vite`; telemetry off.
  - **`preview.tsx`:** imports `../src/styles/globals.css`; sets `layout: "fullscreen"`, `a11y: { test: "error" }` and `controls.expanded`; adds the decorator and toolbar above.
  - **`preview-head.html`:** the same font `<link>`s as `index.html`, with a comment to keep the two in sync.
- [ ] **Step 3: Add the story test project.** Split Vitest in `vite.config.ts` into `test.projects`:
  - **`unit`:** today's jsdom config.
  - **`storybook`:** `extends: true`, plugin `storybookTest({ configDir: ".storybook" })`, browser `{ enabled: true, headless: true, provider: playwright(), instances: [{ browser: "chromium" }] }`, setup `.storybook/vitest.setup.ts` (calls `setProjectAnnotations` with the preview and the a11y annotations).
  - **Scripts:** `test` = `vitest run --project unit`; add `test:storybook` = `vitest run --project storybook`, `storybook` = `storybook dev -p 6006`, `build-storybook` = `storybook build`. Append `&& pnpm build-storybook` to `verify`.
- [ ] **Step 4: Write `ThemeScope.stories.tsx` first** (`title: "Foundations/Theme scope"`, `tags: ["!dev", "!autodocs"]` so it stays out of the sidebar but is tested).
  - It injects a fixture style, `[data-theme="scope-check"] { --color-fg: var(--brand-brown-700); --font-sans: monospace; }`, which uses only existing primitives, so there's no raw color.
  - It renders an outer paragraph and a paragraph inside `<div data-theme="scope-check">`.
  - Its `play` asserts:
    - the inner `getComputedStyle(p).color` equals that of a reference element styled with `color: var(--brand-brown-700)`, and differs from the outer paragraph's color
    - the inner `fontFamily` contains `monospace`
  - Run `corepack pnpm test:storybook`. Expected: PASS (1 story). Then temporarily delete the `[data-theme]` base rule from `globals.css`, rerun, expect FAIL, and restore it.
- [ ] **Step 5: Prove the a11y gate bites.** Temporarily add a story rendering `text-decor` on `bg-surface` small text (4.3:1). Run `test:storybook` and expect FAIL with a `color-contrast` violation. Delete the story.
- [ ] **Step 6: Write `Introduction.mdx`.**
  - **The brand:** two short paragraphs (Quiet sage: light, clean; Plus Jakarta Sans).
  - **How themes work:** the semantic tokens are the contract, and `data-theme` on a wrapper switches a subtree.
  - **Where tokens live:** `src/styles/globals.css`.
- [ ] **Step 7: Update lint, knip, ignores and CI.**
  - **ESLint:** `*.stories.tsx` and `.storybook/**/*.tsx` are exempt from `presentation/no-restricted-syntax` except `classStringRules`, and from the type-file rule (portfolio's block). Ignore `storybook-static/**`. `.storybook` files get node/browser globals as needed.
  - **Prettier and git:** ignore `storybook-static`.
  - **knip:** passes without new ignores beyond what the Storybook plugin needs.
  - **CI:** `check` gets `pnpm build-storybook` after `pnpm build`; `e2e` gets `pnpm test:storybook` after the Playwright install.
- [ ] **Step 8: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: both exit 0.
- [ ] **Step 9: Commit:** `git commit -m "feat: storybook with a11y gate and theme picker"`

### Task 4: Status icons and the Color page

**Files:**

- Create:
  - `src/shared/icons/StatusIcon.tsx`, `StatusIcon.type.ts`, `StatusIcon.data.ts`, `StatusIcon.style.ts`
  - `src/content/foundations.ts`
  - `src/styles/foundations/Color.mdx`, `Color.stories.tsx`, `foundations.style.ts`

**Interfaces:**

- Consumes: `readThemes`, `semanticColorTokens`, `contrastPairs`, `minimumRatio`, `contrastRatio`, and `context.globals.theme`.
- Produces:
  - `StatusIcon({ status, className }: { status: TStatus; className?: string })`, with `TStatus = "active" | "paused" | "cancelled" | "danger"`.
    - **SVG:** 16px, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `aria-hidden="true"`, `focusable="false"`.
    - **Shapes:** active = check in a circle, paused = two bars, cancelled = × in a circle, danger = ! in a triangle. Path data lives in `StatusIcon.data.ts`.
  - `foundationsContent` in `src/content/foundations.ts`: a purpose line for each semantic token (the spec table's "Use" column), the status words (`Active`, `Paused`, `Cancelled`, `Error`), and section labels. Task 5 adds to it.

- [ ] **Step 1: Read tokens in `Color.stories.tsx`.** Use `import css from "@/styles/globals.css?raw"` and `readThemes(css)`; pick the theme matching `context.globals.theme`.
- [ ] **Step 2: Write the stories.**
  - **Semantic:** a swatch per `semanticColorTokens` entry, filled with `var(--color-<name>)`. The name, resolved hex and purpose sit as text below the swatch, never on it.
  - **Palette:** the theme's `primitives`, captioned "never use directly".
  - **Status:** four pills on `bg-status-*`, each with `text-on-status-*`, a `StatusIcon` and its word.
  - **Contrast:** a table over `contrastPairs` showing ratio, required minimum and pass/fail. `text` rows preview "Aa" in fg on bg; `ui` rows preview a 2px fg border box on bg with no text (Review Focus 4).
- [ ] **Step 3: Write `Color.mdx`** like portfolio's `Color.mdx`: semantic first, then palette, status ("color never carries meaning alone"), and contrast, with Use / Don't use / Accessibility / Do-Don't sections.
- [ ] **Step 4: Run `corepack pnpm test:storybook`.** Expected: all Color stories PASS with zero a11y violations.
- [ ] **Step 5: Run `corepack pnpm verify`.** Expected: exit 0.
- [ ] **Step 6: Commit:** `git commit -m "feat: status icons and color foundations page"`

### Task 5: Typography page

**Files:**

- Create: `src/styles/foundations/Typography.mdx`, `Typography.stories.tsx`
- Modify:
  - `src/styles/themeTokens.ts` and `.type.ts`: add `readTypeScale`
  - `src/styles/themeTokens.test.ts`
  - `src/content/foundations.ts`: the specimen copy

**Interfaces:**

- Produces: `readTypeScale(css: string): ITypeStep[]`, with `ITypeStep = { name: string; size: string; lineHeight: string; letterSpacing: string; fontWeight: string }`. It is read from the `@theme` `--text-<step>` family, keeps source order, and skips the `--text-*: initial` reset.

- [ ] **Step 1: Write the failing test** `readTypeScale lists steps in source order with their sub-properties`. The fixture has two steps; assert the exact array.
- [ ] **Step 2: Run the test.** Expected: FAIL. **Step 3: Implement `readTypeScale`.** **Step 4: Rerun.** Expected: PASS.
- [ ] **Step 5: Write the stories.**
  - **Family:** the resolved `fonts.sans` and `fonts.heading` for the active theme, each with a pangram set in that family.
  - **Scale:** a row per step rendered with `text-<step>`, showing its size, line height, weight and tracking.
  - **Card hierarchy:** the subscription card's text stack: eyebrow, title, section, body, small, and a price with `tabular-nums` (copy from `foundationsContent`).
- [ ] **Step 6: Write `Typography.mdx`:** the family, the scale, when to use each step, the "prices use `tabular-nums`" rule, and headings using `font-heading`.
- [ ] **Step 7: Verify.** Run `corepack pnpm test && corepack pnpm test:storybook && corepack pnpm verify`. Expected: all exit 0.
- [ ] **Step 8: Commit:** `git commit -m "feat: typography foundations page"`

### Task 6: Framing exception and docs

**Files:**

- Modify: `vercel.json`, `vite.config.ts`, `AGENTS.md`, `README.md`

- [ ] **Step 1: Split the headers in `vercel.json`** into two rules:
  - **`/((?!iframe\\.html$).*)`:** today's five headers.
  - **`/iframe.html`:** the same set, but with `X-Frame-Options: SAMEORIGIN` and a CSP of `frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'`.
- [ ] **Step 2: Fix the preview headers.** `vite.config.ts` builds `preview.headers` from the rule whose `source` is not `/iframe.html`, so `vite preview` keeps `DENY`.
- [ ] **Step 3: Run `corepack pnpm test:e2e`.** Expected: 12 PASS, including "responses carry the security headers".
- [ ] **Step 4: Update the docs.**
  - **AGENTS.md commands table:** `storybook`, `build-storybook`, `test:storybook`.
  - **AGENTS.md workflow:** run `test:storybook` before review; the stories exemption; foundations pages live in `src/styles/foundations`; the iframe framing exception in "Security headers".
  - **README:** Storybook commands, plus a link placeholder line `Storybook: <url>` that the controller fills in after deploy.
- [ ] **Step 5: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 6: Commit:** `git commit -m "chore: storybook framing exception and docs"`

_(Controller:)_

- Create the Vercel project `natura-wellness-storybook` through the REST API: same repo; framework Other; build `pnpm build-storybook`; output `storybook-static`; install `pnpm install --frozen-lockfile`. Don't touch `.vercel/project.json`.
- Push, open PR 2 against `feat/brand-tokens`, and fill in the README URL.
- Check that the deployed Storybook renders Color and Typography with visible canvases, and that `/iframe.html` answers `SAMEORIGIN`.
