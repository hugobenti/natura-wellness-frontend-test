# Brand foundations: palette, typography, themes, Storybook

Date: 2026-11-05 · Branch: `feat/brand-foundations` (stacked on `chore/house-setup`, PR #1)

## Intent

Before building Part A (the "Manage my subscription" page), give the project a brand: a color palette and a type system, wired as design tokens, documented in Storybook. Hugo started from four colors he likes (`#E7EFC7` `#AEC8A4` `#8A784E` `#3B3B1A`) as a starting point, not fixed values, and wants a **light, clean UI**.

Part B (the buy box) must match a reference screenshot whose colors and fonts differ from the brand. It will get **its own theme later**. This work doesn't define that theme, but the tokens must be ready for a per-area theme switch.

## Goals

- A light-only brand theme ("Quiet sage") as semantic tokens in `src/styles/globals.css`, with every text/UI pair passing WCAG 2.2 AA and tested.
- Status colors that are clearly distinct from each other (Hugo's explicit feedback: the first set was too close).
- Plus Jakarta Sans as the single brand typeface, with a named type scale.
- Token structure that lets a second theme swap every color and the font by setting `data-theme` on a wrapper.
- Storybook with a Foundations section: Color and Typography pages, read from the live tokens, with an a11y check and a theme picker. Deployed to its own Vercel project.

## Non-goals

- Part B's theme values (later work; only the mechanism now).
- Spacing, radius, shadow, motion pages (portfolio has them; not asked for now).
- Components (Button, Pill…) and Part A UI. Storybook documents foundations only.
- A token build pipeline like portfolio's (`tokens/build.mjs`, DTCG JSON). CSS stays the single source (see "Calls made").

## Anti-goals

- Dark mode. Hugo wants light only; the house template's dark scheme is removed, not left half-working.
- Color as the only signal of a status. Every status always ships with its own icon and word (the components will do this; the docs must say so).
- Docs that can drift from code: Storybook reads the same CSS the app ships; no hand-copied hex values in stories.

## Decisions (Hugo's)

1. **Palette direction A, "Quiet sage":** faint lime-washed page, white cards, dark olive `#3B3B1A` for all text and the primary button. Lime and sage are soft fills only; brown is decoration only, with a deepened brown for secondary text.
2. **Status colors, "stronger tints":** soft pills in four clearly different hues: green active, amber paused, grey cancelled, red error/danger. Success messages reuse the green.
3. **Typography C:** Plus Jakarta Sans for everything (titles included).
4. **Themes:** Part B will switch theme to its own palette later; make tokens ready.
5. **Storybook:** follow `~/Projects/portfolio`'s pattern (Foundations section, MDX pages + stories, `@storybook/addon-a11y` with `a11y.test: "error"`, own Vercel project like `hugobentivegna-storybook`), but Color and Typography only.

## Token values

### Primitives (raw palette)

Declared once; never used by components or style files directly. `★` marks Hugo's four colors.

| Primitive     | Value     | Note                                            |
| ------------- | --------- | ----------------------------------------------- |
| `lime-50`     | `#F7F9EE` | page wash                                       |
| `lime-100` ★  | `#E7EFC7` |                                                 |
| `lime-200`    | `#DDE5C4` | dividers                                        |
| `sage-300` ★  | `#AEC8A4` |                                                 |
| `sage-100`    | `#DDE9D3` | selected option fill                            |
| `sage-600`    | `#7E8B63` | control borders                                 |
| `brown-500` ★ | `#8A784E` | decoration only (4.3:1 on white, below text AA) |
| `brown-700`   | `#6B5D3A` | secondary text                                  |
| `olive-900` ★ | `#3B3B1A` |                                                 |
| `olive-950`   | `#2A2A10` | hover                                           |
| `white`       | `#FFFFFF` |                                                 |
| `green-100`   | `#D6EBC8` |                                                 |
| `green-800`   | `#2F5A1E` |                                                 |
| `amber-100`   | `#FBE3B0` |                                                 |
| `amber-800`   | `#7A4E00` |                                                 |
| `grey-100`    | `#E4E4E0` |                                                 |
| `grey-700`    | `#4A4A44` |                                                 |
| `red-100`     | `#FADAD3` |                                                 |
| `red-700`     | `#A12C1A` |                                                 |

### Semantic tokens (what components use)

These names are the theme contract: every theme defines every one of them.

| Token                                      | Brand value               | Use                                      |
| ------------------------------------------ | ------------------------- | ---------------------------------------- |
| `bg`                                       | `lime-50`                 | page                                     |
| `surface`                                  | `white`                   | cards                                    |
| `line`                                     | `lime-200`                | card borders, dividers (decorative)      |
| `control-line`                             | `sage-600`                | input/radio/checkbox borders (UI, ≥ 3:1) |
| `fg`                                       | `olive-900`               | text                                     |
| `muted`                                    | `brown-700`               | secondary text (dates, hints, links)     |
| `accent`                                   | `olive-900`               | primary button fill, links               |
| `accent-hover`                             | `olive-950`               | primary button hover                     |
| `on-accent`                                | `lime-50`                 | text on `accent` / `accent-hover`        |
| `focus`                                    | `olive-900`               | focus ring                               |
| `fill-soft`                                | `lime-100`                | soft fills, product tiles                |
| `fill-selected`                            | `sage-100`                | selected option fill                     |
| `decor`                                    | `brown-500`               | icons and rules only, never text         |
| `status-active` / `on-status-active`       | `green-100` / `green-800` | active pill, success message             |
| `status-paused` / `on-status-paused`       | `amber-100` / `amber-800` | paused pill                              |
| `status-cancelled` / `on-status-cancelled` | `grey-100` / `grey-700`   | cancelled pill                           |
| `status-danger` / `on-status-danger`       | `red-100` / `red-700`     | errors (e.g. the 409 skip conflict)      |

Naming follows the existing house convention (`accent` / `on-accent`), so Tailwind generates `bg-status-paused text-on-status-paused`.

### Contrast pairs to test

Measured during brainstorming; all pass.

- **Text, ≥ 4.5:1:** `fg` on `bg` (10.8), `fg` on `surface` (11.5), `muted` on `bg` (6.1), `muted` on `surface` (6.5), `on-accent` on `accent` (10.8), `on-accent` on `accent-hover` (13.7), `accent` on `surface` and on `bg` (links), `fg` on `fill-soft` (9.6), `muted` on `fill-soft` (5.4), `fg` on `fill-selected` (9.1), `muted` on `fill-selected` (5.1), each `on-status-*` on its `status-*` (6.4 / 5.7 / 7.0 / 5.6).
- **UI, ≥ 3:1:** `control-line` on `surface` (3.7) and on `bg` (3.4), `focus` on `bg` and `surface`, `decor` on `surface` (4.3) and `bg` (4.1).

### Typography

- **Font roles:** two font tokens, `--font-sans` (text) and `--font-heading` (titles and section headings). The brand sets both to Plus Jakarta Sans, with a system sans fallback. Part B's theme will later set Inter and Fraunces. The current `--font-display` token is removed. Plus Jakarta Sans loads from Google Fonts in `index.html`, weights 400, 500, 600 and 700, added to the existing link; Fraunces and Inter stay for Part B. The body uses `font-sans`, and `h1`/`h2` use `font-heading`.
- **Scale:** Tailwind's default `--text-*` scale is removed (like the color palette), so only these sizes exist. Mobile-first values; nothing scales up at desktop for now.

| Token     | Size | Line height | Weight | Tracking | Use                         |
| --------- | ---- | ----------- | ------ | -------- | --------------------------- |
| `title`   | 28px | 1.15        | 700    | -0.02em  | page `h1`                   |
| `section` | 17px | 1.3         | 700    | 0        | card / section headings     |
| `body`    | 15px | 1.5         | 400    | 0        | default text, buttons (600) |
| `small`   | 13px | 1.4         | 400    | 0        | secondary info, fine print  |
| `eyebrow` | 11px | 1.3         | 600    | 0.12em   | uppercase labels            |

- **Prices:** use `tabular-nums` (documented on the Typography page).

## Theme mechanism

- **Default theme:** the brand theme. Its semantic tokens are declared in the `@theme` block, so Tailwind generates the utilities and they apply on `:root`.
- **Other themes:** a theme is a CSS block `[data-theme="<name>"] { … }` that redefines **every** semantic color token plus `--font-sans` and `--font-heading`. Any element with `data-theme` re-themes its subtree; no component changes. Part B will later get `<section data-theme="buybox">`.
- **Primitives per theme:** each theme brings its own primitives (the brand's live under a `brand` prefix or equivalent; the builder picks the naming). Semantic tokens point at primitives with `var()`.
- **Contrast test:** extended from "light + dark" to "every theme in the CSS". It resolves `var()` references to hex, checks the pairs above for each theme, and fails when a theme block misses a semantic token. Removing the dark block and the dark-only test is part of this work.
- **Test-only theme:** no second real theme exists yet. The test must prove the reader handles a `data-theme` block, e.g. with a small CSS fixture string in the test. No placeholder theme in `globals.css`.

## Storybook

- **Packages:** `storybook` 10.x, `@storybook/react-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y` and `@storybook/addon-vitest` (all 10.6.x; they support Vite 7, React 19 and Vitest 5), plus `@vitest/browser-playwright` 5.x. Config in `.storybook/main.ts` and `.storybook/preview.tsx`, mirroring portfolio's.
- **Preview:**
  - imports `src/styles/globals.css`
  - a canvas decorator renders every story on `bg-bg font-sans text-fg`
  - `a11y: { test: "error" }`
- **Theme picker:** a toolbar global (`theme`) listing the themes, currently just `brand`. The decorator sets `data-theme` on the story wrapper. With one theme it's a no-op; it exists so Part B's theme shows up with no Storybook changes. Theme names come from one TS list that the app will also use for Part B.
- **Pages** (`src/styles/foundations/` or similar; builder's call, inside the kernel):
  - `Introduction.mdx`: what the brand is (two short paragraphs), how themes work, where tokens live.
  - **Color:**
    - semantic swatches (name, resolved hex, purpose)
    - the primitive palette (marked "never use directly")
    - the status set, each shown with its icon and word to model the rule. The icons are inline SVG components in `src/shared/icons` (active, paused, cancelled, danger), the way portfolio does icons: no icon library. Part A reuses them.
    - a contrast table computed with the same `contrastRatio()` the test uses
    - Use / Don't use / Accessibility / Do-Don't sections, like portfolio's `Color.mdx`
  - **Typography:**
    - the family
    - each scale step rendered with its size, line height, weight and tracking
    - a sample of the subscription card's text hierarchy (title, section, body, small, eyebrow, price)
    - usage rules
- **Single source:** stories read the token values from the CSS at runtime (computed styles or parsing `globals.css`), never from hex literals in story files.
- **Lint:**
  - Stories and `.storybook/**` get the same exemption portfolio uses: they may set up browser state and keep local types.
  - All other house rules still apply. Copy may live in MDX.
  - `storybook-static/` is ignored by ESLint, Prettier and git; knip must understand the Storybook entry points.
- **Accessibility fails CI (Hugo's decision):** `@storybook/addon-vitest` runs every story in Vitest browser mode (Playwright Chromium) with `a11y: { test: "error" }`, so an axe violation in any story or docs example fails the run.
  - The story tests are a separate Vitest project (e.g. `pnpm test:storybook`), so the existing jsdom `pnpm test` stays fast.
  - The story tests run in CI's `e2e` job, which already installs Chromium; the required checks stay `check` and `e2e`.
  - `verify` stays browser-free, like today. AGENTS.md says to run `pnpm test:storybook` before review alongside `pnpm test:e2e`.
  - Prove it bites: temporarily add a failing-contrast story, see the run fail, then remove it.
- **Scripts:** `storybook` (dev, port 6006), `build-storybook` (output `storybook-static`), `test:storybook`. `verify` and CI's `check` job run `build-storybook`.
- **Vercel:** a new project `natura-wellness-storybook` on the same repo, matching `hugobentivegna-storybook`:
  - Framework: Other
  - Build: `pnpm build-storybook`
  - Output: `storybook-static`
  - Install: `pnpm install --frozen-lockfile`
  - Create and configure it through the Vercel CLI/API without relinking the working copy: `.vercel/project.json` stays pointed at the app project. Build settings live in the project, not in `vercel.json`, which both projects share.
- **Framing headers:** both projects read the root `vercel.json`, whose `X-Frame-Options: DENY` and `frame-ancestors 'none'` would blank Storybook's canvases (the manager frames `/iframe.html`). Keep `DENY` for every path except `/iframe.html`, which gets `SAMEORIGIN` and `frame-ancestors 'self'`. The app has no `iframe.html`, so its protection is unchanged; the e2e header test still passes. `vite.config.ts` reads the headers from `vercel.json`, so the builder makes sure `vite preview` still gets the `DENY` set for `/`.

## Delivery

Two stacked PRs, each under the ~20-file branch rule in AGENTS.md:

1. **`feat/brand-tokens`:** primitives, semantic tokens, font roles and the type scale; dark mode removed; the theme-aware contrast test; Plus Jakarta Sans loading; status icons; AGENTS.md token rules. Verified by `pnpm verify` and `pnpm test:e2e`. It also includes this design doc.
2. **`feat/storybook`:** Storybook config, the Introduction, Color and Typography pages, the theme picker, the Vitest story tests with the a11y gate, lint/knip/ignore updates, CI, the `vercel.json` iframe exception, the Vercel project, and README/AGENTS.md commands. Verified by `build-storybook`, `test:storybook` passing (and failing on a planted violation), and the deployed Storybook rendering both pages.

## Docs to update

- `AGENTS.md`:
  - Token-only styling: primitives vs. semantic, theme contract, no dark mode.
  - Commands: `storybook`, `build-storybook`.
  - Repo map: the foundations docs.
  - A rule that a new semantic token goes in every theme and in the contrast test.
- `README.md`: the Storybook link and commands.
- PR template: the contrast-test path.

## Calls made (mine, not Hugo's; check these)

- **Exact values:** derived and added colors (`lime-50`, `lime-200`, `sage-600`, `brown-700`, `olive-950` and the four status pairs), the token names and the type scale numbers.
- **CSS as the only token source:** no JSON token pipeline. The house template already uses `globals.css` as the single source, and one theme plus a planned second doesn't justify a build step.
- **Default type scale removed:** Tailwind's default type scale is removed, mirroring the palette removal.
- **CI coverage:** Storybook builds in CI and `verify`.
- **Introduction page:** an Introduction page alongside Color and Typography.
- **Theme picker:** shipped with a single entry.
- **Font roles:** two of them (`sans`, `heading`), replacing `display`, so Part B can bring its serif.
- **Status icons:** inline SVG icons, no icon library.
- **Framing exception:** the `/iframe.html` framing exception, so one `vercel.json` serves both projects.
- **Two PRs:** delivery split into two stacked PRs.

## Left to the builder

- File locations inside `src/styles` (or a sibling kernel folder) and the primitive naming scheme.
- How stories read live token values.
- Story structure and MDX wording, following portfolio's tone.
- Whether `Plus Jakarta Sans` needs `font-display: swap` tuning (the existing link already uses `display=swap`).
