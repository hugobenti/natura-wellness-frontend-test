# Shared UI Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Twelve theme-ready shared components in `src/shared/components`, each documented and tested in Storybook, ready for the Part A page and Part B's buy box.

**Architecture:**

- Native elements (`button`, `input[type=radio]`, `select`, `dialog`) styled only with semantic tokens.
- Shape (radii) joins colors and fonts in the theme contract, so a `data-theme` block restyles every component.
- Behavior lives in `useX.ts` hooks and pure `src/shared/logic` modules (unit-tested). Interaction and a11y are proven by Storybook play functions running in real Chromium (`test:storybook`).

**Tech Stack:** Vite 7, React 19, TypeScript 6, Tailwind v4, Vitest 5.1 (jsdom + browser mode), Storybook 10.6.5, pnpm 10.34.9.

**Spec:** `docs/superpowers/specs/2026-11-05-shared-ui-components-design.md` (component table, token additions, the control-border decision). Read it before any task.

## Global Constraints

- All AGENTS.md rules:
  - presentation-only `.tsx`, classes in `X.style.ts` via `cx()`
  - types in `X.type.ts` with `I`/`T` prefixes
  - copy in `src/content`, token-only styling
  - the kernel never imports `part-*` or `app`
  - stories are lint-exempt except class-string and no-raw-color
- Component folder: `src/shared/components/<Name>/` with `<Name>.tsx`, `.style.ts`, `.type.ts`, `use<Name>.ts` (if behavior), `<Name>.stories.tsx`, `<Name>.mdx`. Stories are titled `Components/<Name>`.
- Copy: `src/content/components/<camelName>.ts`, one file per component, exporting `<camelName>Content`.
- Native elements only. No custom ARIA widgets, no focus-trap or roving-tabindex code, no new runtime dependencies.
- Control borders (Hugo's decision):
  - `border-line` only where visible text plus an icon identify the control: `Select`, `QuantityStepper`, unselected `RadioGroup` cards.
  - `border-control-line` for the radio circle, checkboxes and empty text inputs.
  - A selected card gets `border-accent`.
  - Focus always gets the `focus` ring (`focus-visible:outline-focus`, from the base layer).
- Radii only via `rounded-control`, `rounded-card` and `rounded-pill`. Text sizes only via `text-title|section|body|small|eyebrow`.
- Motion: opacity fades only; spinners are static under `prefers-reduced-motion`.
- Never edit `INSTRUCTIONS.md` or `src/api/**`; never commit to `main`.
- Before each commit: `corepack pnpm verify` and `corepack pnpm test:storybook` exit 0. Before each PR: `corepack pnpm test:e2e` too.

## Review Focus

1. **Pending `Button`:** a second activation must do nothing (mouse, Enter, Space), while the button keeps focus and its accessible name (Task 4).
2. **`RadioGroup` card panels:** controls inside a selected card's `panel` (Part B's frequency `Select`) must be reachable by Tab and must not change the selected radio when used (Task 10).
3. **`ResponsiveDialog` closed by Esc:** this must call `onClose`, so the parent's `open` state matches. Reopening right after an Esc close must work, and focus must return to the trigger (Task 12).
4. **`ProductThumbnail`:** a 404 `src` must fall back to the initial tile, never a broken-image icon (Task 7).
5. **Border-rule misuse:** the radio circle and an empty textarea must use `control-line`. Only `Select`, stepper and unselected card frames may use `line` (Tasks 9, 10, 11; checked by the reviewer, not a test).

---

## PR 1 `feat/ui-foundation`: tokens, Icon, conventions (branch exists, from `main` @ 3bd0a9f)

### Task 1: Shape roles and highlight tokens

**Files:**

- Modify:
  - `src/styles/globals.css`, `src/styles/themeContract.ts`, `src/styles/contrastPairs.ts`
  - `src/styles/themeTokens.ts`, `themeTokens.type.ts`, `themeTokens.test.ts`, `tokenContrast.test.ts`
  - `src/styles/foundations/foundations.style.ts`, `src/content/foundations.ts`

**Interfaces:**

- **Produces:**
  - `radiusRoles = ["control", "card", "pill"] as const`.
  - `ITheme` gains `radii: Record<string, string>` (keyed by role, e.g. `radii.control === "10px"`), with `declared` entries `radius:<role>`.
  - `semanticColorTokens` gains `highlight` and `on-highlight` (23 total).

- [ ] **Step 1: Write the failing reader test** in `themeTokens.test.ts`.
  - A fixture with `@theme static { --radius-*: initial; --radius-control: 10px; }` and `[data-theme="alt"] { --radius-control: 4px; }`.
  - Assert `brand.radii.control === "10px"`, `alt.radii.control === "4px"`, and that `alt.declared` contains `"radius:control"`.
  - Run `corepack pnpm vitest run --project unit src/styles/themeTokens.test.ts`. Expected: FAIL.
- [ ] **Step 2: Implement `radii`** in `readThemes`, with the same resolution and inheritance as `fonts`. The `--radius-*` wildcard reset is skipped. Rerun: PASS.
- [ ] **Step 3: Extend the contract test in `tokenContrast.test.ts`.**
  - The exact-contract assertion includes `radiusRoles.map(r => "radius:" + r)`.
  - Add the pairs `{fg:"on-status-danger",bg:"surface",kind:"text"}`, `{fg:"on-status-danger",bg:"bg",kind:"text"}`, `{fg:"accent",bg:"fill-selected",kind:"ui"}` and `{fg:"on-highlight",bg:"highlight",kind:"text"}` to `contrastPairs.ts`.
  - Run `corepack pnpm test`. Expected: FAIL on the missing tokens.
- [ ] **Step 4: Update `globals.css`.**
  - **Radii:** replace `--radius-sm/md/lg` with `--radius-*: initial; --radius-control: 10px; --radius-card: 14px; --radius-pill: 9999px;`.
  - **Highlight pair:** add `--color-highlight: var(--brand-lime-100); --color-on-highlight: var(--brand-olive-900);`.
  - **Contract and copy:** add the radius roles to `themeContract.ts` and purpose lines for the two new colors to `foundationsContent.tokenPurpose`.
  - **Foundations styles:** migrate `foundations.style.ts`: `rounded-lg` → `rounded-card`, `rounded-md`/`rounded-sm` → `rounded-control`, `rounded-full` → `rounded-pill`.
- [ ] **Step 5: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0; the Color page shows `highlight`.
- [ ] **Step 6: Commit:** `feat: shape roles and highlight tokens in the theme contract`

### Task 2: Icon replaces StatusIcon

**Files:**

- Create: `src/shared/icons/Icon.tsx`, `Icon.data.ts`, `Icon.type.ts`, `Icon.style.ts`, `Icon.stories.tsx`, `Icon.mdx`
- Delete: `src/shared/icons/StatusIcon.*` (4 files)
- Modify: `src/styles/foundations/Color.stories.tsx`

**Interfaces:**

- **Produces:**
  - `Icon({ name, className }: IIconProps)`, with `TIconName` = `"check" | "check-circle" | "pause" | "x-circle" | "alert-triangle" | "info" | "chevron-down" | "minus" | "plus" | "close"`.
  - `iconPaths: Record<TIconName, readonly string[]>`.
  - `Icon.style.ts`: `{ base: "size-4 shrink-0" }`; callers resize through `className`.
- **SVG attributes:** the same as today's `StatusIcon`: `viewBox="0 0 24 24"`, stroke `currentColor`, width 2, round caps and joins, `aria-hidden`, `focusable="false"`.

- [ ] **Step 1: Build `Icon`.** Port the four status paths to `check-circle`, `pause`, `x-circle` and `alert-triangle`, and draw the other six.
- [ ] **Step 2: Migrate `Color.stories.tsx`.** It uses `<Icon name=…>` with a story-local status → name map. Delete `StatusIcon.*`, then `grep -r StatusIcon src` and expect nothing.
- [ ] **Step 3: Write the docs.**
  - **`Icon.stories.tsx` (`Components/Icon`):** a gallery story showing every name with its label, and an "inherits color" story using `text-on-status-danger`.
  - **`Icon.mdx`:** use with a visible word; never the only signal; size through `className`.
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: icon set replacing StatusIcon`

### Task 3: Component conventions and overview

**Files:**

- Create: `src/shared/components/Overview.mdx` (`Components/Overview`)
- Modify: `AGENTS.md`
- Add (already written): the spec and this plan under `docs/superpowers/`

- [ ] **Step 1: Write `Overview.mdx`.**
  - The shared rules: native elements; presentation-only; theme-ready (colors, fonts, radii); the control-border rule; inline feedback, no toasts.
  - A table of the twelve components with a one-line purpose. A row links to its docs page only once that component exists; list the others as plain text, so no link is dead.
- [ ] **Step 2: Update `AGENTS.md`.**
  - **Repo map:** add `src/shared/components` and `src/content/components`.
  - **Component-folder convention:** the six files plus the content file.
  - **Radius roles:** in the Token-only styling rule.
  - **Control-border rule:** verbatim from the Global Constraints above.
  - **Stories rule:** behavior is proven with play functions in the component's stories.
- [ ] **Step 3: Format the docs.** Run `corepack pnpm exec prettier --write docs`, then `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 4: Commit:** `docs: shared component conventions, design and plan`

_(Controller: push, open PR 1, watch CI, check the Storybook preview at 1280 and 375.)_

---

## PR 2 `feat/ui-button` (stacked on PR 1)

### Task 4: Button

**Files:**

- Create: `src/shared/components/Button/Button.tsx`, `.style.ts`, `.type.ts`, `useButton.ts`, `useButton.test.ts`, `Button.stories.tsx`, `Button.mdx`

**Interfaces:**

- **Consumes:** `Icon` (Task 2).
- **Produces:**
  - `Button(props: IButtonProps)`. `IButtonProps` extends `ButtonHTMLAttributes<HTMLButtonElement>` with:
    - `variant?: keyof typeof button.variant` (`primary | secondary | quiet | destructive`, default `primary`)
    - `size?: keyof typeof button.size` (`md | lg | icon`, default `md`)
    - `fullWidth?: boolean`
    - `pending?: boolean`
  - `type` defaults to `"button"`.
  - `useButton({ pending, onClick })` returns `{ onClick, "aria-disabled": true | undefined, "aria-busy": true | undefined }`.
- **Variants:**
  - primary: `bg-accent text-on-accent hover:bg-accent-hover`
  - secondary: `border-control-line bg-surface text-fg`
  - quiet: text only, `text-fg underline-offset-…`
  - destructive: `border-on-status-danger text-on-status-danger bg-surface`
  - `rounded-control` throughout.

- [ ] **Step 1: Write the failing test** `useButton ignores clicks while pending`.
  - `renderHook` with `pending: true` and a mock `onClick`. Calling the returned `onClick` with a fake event calls `preventDefault` and not the mock, and the hook returns `aria-disabled: true` and `aria-busy: true`.
  - A second case: `pending: false` forwards the event, and both aria attributes are `undefined`.
  - Run it and expect FAIL.
- [ ] **Step 2: Implement `useButton` and the component.**
  - **Spinner:** a pending button shows an `aria-hidden` spinner before `children`. It's a `span` with `animate-spin` and `motion-reduce:animate-none`; the label stays visible.
  - **Disabled:** native `disabled` greys the button out (`disabled:opacity-50`). `pending` is not `disabled`, so the button stays focusable.
  - Rerun the test: PASS.
- [ ] **Step 3: Write the stories.**
  - All variants, sizes, full width, disabled, and an icon-only `size="icon"` with an `aria-label` from the story.
  - `PendingIgnoresRepeat` play test: `args.onClick = fn()`, `pending: true`. Click the button, then focus it and press Enter and Space. `expect(args.onClick).not.toHaveBeenCalled()`, the accessible name is unchanged, and `document.activeElement` is the button.
- [ ] **Step 4: Write `Button.mdx`:** which variant to use when, the "one primary per view" rule, how `destructive` differs from primary, and the pending semantics.
- [ ] **Step 5: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 6: Commit:** `feat: Button with pending guard`

---

## PR 3 `feat/ui-status-feedback` (after PR 2)

### Task 5: Badge and StatusBadge

**Files:**

- Create:
  - `src/shared/components/Badge/{Badge.tsx,Badge.style.ts,Badge.type.ts,Badge.stories.tsx,Badge.mdx}`
  - `src/shared/components/StatusBadge/{StatusBadge.tsx,StatusBadge.type.ts,StatusBadge.data.ts,StatusBadge.stories.tsx}`
  - `src/content/components/statusBadge.ts`

**Interfaces:**

- **Badge:**
  - Props: `Badge({ tone, icon?, children, className })`, with `tone: keyof typeof badge.tone` (`highlight | active | paused | cancelled | danger`).
  - Status tones: `bg-status-*` / `text-on-status-*`, `text-small font-semibold`.
  - `highlight`: `bg-highlight text-on-highlight text-eyebrow uppercase`.
  - Shape: `rounded-pill`.
- **StatusBadge:**
  - Props: `StatusBadge({ status })`, with `status: "active" | "paused" | "cancelled"`.
  - Composes `Badge`: `tone = status`, `icon` from `statusBadgeIcon` (`.data.ts`: active→`check-circle`, paused→`pause`, cancelled→`x-circle`), and the word from `statusBadgeContent.label[status]`.

- [ ] **Step 1: Build `Badge` and `StatusBadge`.** No hook is needed (pure mapping via data and content).
- [ ] **Step 2: Write the stories.** `Badge`: every tone, with and without an icon, and `highlight` with the sentence-case copy "Best value" rendering in capitals. `StatusBadge`: one story per status. The docs live on `Badge.mdx` with a StatusBadge section.
- [ ] **Step 3: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 4: Commit:** `feat: Badge and StatusBadge`

### Task 6: Alert

**Files:**

- Create: `src/shared/components/Alert/{Alert.tsx,Alert.style.ts,Alert.type.ts,Alert.data.ts,Alert.test.tsx,Alert.stories.tsx,Alert.mdx}`

**Interfaces:**

- **Consumes:** `Icon`; `Button` in the stories (as the `action`).
- **Produces:** `Alert({ tone, title, children?, action?, className })`, with `tone: "success" | "info" | "danger"`.
  - **Data (`Alert.data.ts`):** role per tone is `{ success: "status", info: "status", danger: "alert" }`; icon per tone is `check-circle`, `info`, `alert-triangle`.
  - **Colors:** success `bg-status-active text-on-status-active`, info `bg-fill-soft text-fg`, danger `bg-status-danger text-on-status-danger`.
  - **Shape:** `rounded-card`.

- [ ] **Step 1: Write the failing test** `Alert announces errors assertively and successes politely` (Testing Library). `tone="danger"` is found by `getByRole("alert")`, and `tone="success"` by `getByRole("status")`. Run and expect FAIL.
- [ ] **Step 2: Implement `Alert`.** Rerun: PASS.
- [ ] **Step 3: Write the stories.**
  - Success, info and danger. The danger story uses the spec's 409 copy, "Your subscription changed elsewhere. We reloaded it; check and try again.", with a quiet `Button` "Reload".
  - **`Alert.mdx`:** place it next to the action; no toasts; one alert per outcome.
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: Alert`

---

## PR 4 `feat/ui-product-price` (after PR 2)

### Task 7: ProductThumbnail

**Files:**

- Create:
  - `src/shared/components/ProductThumbnail/{ProductThumbnail.tsx,.style.ts,.type.ts,useProductThumbnail.ts,ProductThumbnail.stories.tsx,ProductThumbnail.mdx}`
  - `src/shared/logic/initial.ts`, `initial.test.ts`

**Interfaces:**

- **`initialOf(name: string): string`:** the first letter of the first word, uppercased, or `""` for blank input. Examples: `"Vitamin D, 60 softgels"` → `"V"`, `"  magnesium"` → `"M"`, `""` → `""`.
- **`useProductThumbnail({ src, name, decorative })`:** returns `{ showImage, onError, alt, initial, tileLabel }`.
  - `showImage` is false when `src` is null or after `onError`, and resets when `src` changes.
  - `alt` is `""` when `decorative`, otherwise `name`.
- **`ProductThumbnail({ src, name, size = "md", decorative = false, className })`:**
  - **Sizes:** `sm` 40px, `md` 56px, `lg` 96px. `rounded-control`, `object-cover`.
  - **Fallback tile:** `bg-fill-soft text-fg`, showing the initial. It's `role="img"` with `aria-label={name}` unless `decorative`, in which case it's `aria-hidden`.

- [ ] **Step 1: Write the failing `initial.test.ts`** with the three cases above. Run and expect FAIL. Implement. Rerun: PASS.
- [ ] **Step 2: Implement the hook and the component.**
- [ ] **Step 3: Write the stories.**
  - **`WithImage`:** `/product.jpg`.
  - **`NoImage`:** `src: null`. Play test: `getByRole("img", { name })` has the text `"M"`.
  - **`BrokenImage`:** `src: "/missing.jpg"`. Play test: `await waitFor` until no `<img>` element remains and the fallback tile shows the initial.
  - **`Decorative`:** the axe gate must still pass.
- [ ] **Step 4: Write `ProductThumbnail.mdx`,** then run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: ProductThumbnail with fallback tile`

### Task 8: PriceDisplay and money formatting

**Files:**

- Create:
  - `src/shared/logic/money.ts`, `money.test.ts`
  - `src/shared/components/PriceDisplay/{PriceDisplay.tsx,.style.ts,.type.ts,usePriceDisplay.ts,PriceDisplay.stories.tsx,PriceDisplay.mdx}`
  - `src/content/components/priceDisplay.ts`

**Interfaces:**

- **`formatMoney(cents: number): string`:** `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` over `cents / 100`. Examples: `2546` → `"$25.46"`, `0` → `"$0.00"`, `123456` → `"$1,234.56"`.
- **`usePriceDisplay({ amountCents, compareAtCents })`:** returns `{ price, compareAt, compareAtLabel }`.
  - `compareAt` is `null` when absent or not greater than `amountCents`.
  - `compareAtLabel` combines `priceDisplayContent.wasPrefix` ("Was") with the formatted price.
- **`PriceDisplay({ amountCents, compareAtCents?, size = "md", layout = "inline", className })`:**
  - The price is `font-semibold tabular-nums`. Sizes: `sm` → `text-small`, `md` → `text-body`, `lg` → `text-section`.
  - The original price is `text-muted line-through`, with its visual text `aria-hidden` and a `sr-only` span carrying `compareAtLabel`.
  - `stacked` puts the original price under the price, right-aligned, the way Part B shows it.

- [ ] **Step 1: Write the failing `money.test.ts`** with the three cases. Run and expect FAIL. Implement. Rerun: PASS.
- [ ] **Step 2: Implement the hook and the component.** A `compareAtCents` less than or equal to the amount renders no original price; cover it with a story.
- [ ] **Step 3: Write the stories.**
  - `Inline`, `Stacked` (2546 vs 2995), `Large` and `NoDiscount`.
  - Play test on `Stacked`: the accessible text includes "Was $29.95".
  - **`PriceDisplay.mdx`.**
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: PriceDisplay and money formatting`

---

## PR 5 `feat/ui-form-controls` (after PR 2)

### Task 9: FormField

**Files:**

- Create: `src/shared/components/FormField/{FormField.tsx,.style.ts,.type.ts,useFormField.ts,useFormField.test.ts,FormField.stories.tsx,FormField.mdx}`

**Interfaces:**

- **`useFormField({ hint?, error? })`:**
  - Returns `IFormFieldIds = { controlId, hintId, errorId, describedBy: string | undefined, invalid: true | undefined }`, with ids from `useId()`.
  - `describedBy` joins the hint id and the error id when present.
  - `invalid` is `true` only when there is an error.
- **`FormField({ field, label, hint?, error?, layout = "stacked", children, className })`:**
  - Renders `<label htmlFor={field.controlId}>`, the control, the hint (`id=hintId`, `text-small text-muted`) and the error (`id=errorId`, `role="alert"`, `text-small text-on-status-danger`, with the `alert-triangle` `Icon`).
  - `inline` puts the label and control in a row (Part B's "Delivered every").

- [ ] **Step 1: Write the failing test** `useFormField describes the control with its hint and error`.
  - With both a hint and an error: `describedBy` equals `` `${hintId} ${errorId}` `` and `invalid` is `true`.
  - With neither: `describedBy` and `invalid` are both `undefined`.
  - Run and expect FAIL. Implement. Rerun: PASS.
- [ ] **Step 2: Build the component.**
- [ ] **Step 3: Write the stories.**
  - **`TextareaWithError`:** a native `<textarea>` with `border-control-line rounded-control`, which is the "other reason" case. Play test: `getByLabelText(label)` returns the textarea, it has `aria-invalid="true"`, and its `aria-describedby` points at the error.
  - **`Inline`** and **`WithHint`.**
  - **`FormField.mdx`.**
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: FormField`

### Task 10: RadioGroup (list and card)

**Files:**

- Create: `src/shared/components/RadioGroup/{RadioGroup.tsx,.style.ts,.type.ts,useRadioGroup.ts,RadioGroup.stories.tsx,RadioGroup.mdx}`

**Interfaces:**

- **Props:** `RadioGroup<TValue extends string>({ legend, legendHidden = false, name, value, onChange, appearance = "list", options, className })`.
- **Options:** `IRadioOption<TValue> = { value: TValue; label: ReactNode; description?: ReactNode; trailing?: ReactNode; badge?: ReactNode; panel?: ReactNode }`.
- **Hook:** `useRadioGroup({ value, onChange, options })` returns `{ items: Array<IRadioOption & { checked: boolean; inputId: string; onSelect: () => void }> }`.
- **Markup:**
  - `<fieldset>` with `<legend>` (`sr-only` when `legendHidden`).
  - Each item is a frame `div` holding `<label htmlFor=inputId>` (radio, label, description, badge, trailing). When `checked && panel`, the `panel` is a sibling of the label inside the frame.
- **Styles:**
  - Radio circle: `appearance-none size-5 rounded-pill border-2 border-control-line`, plus a checked inner dot in `accent`.
  - Card frame: `rounded-card border border-line bg-surface`. Checked: `border-2 border-accent bg-fill-selected`.

- [ ] **Step 1: Build the hook and the component.**
- [ ] **Step 2: Write the stories.**
  - **`List`:** the cancellation reasons (38/24/15/12/11% copy from the brief, as story data).
  - **`Cards`:** Part B-like. "One-time purchase" `$29.95` and "Subscribe & save 15%" with a `Badge tone="highlight"` "Best value", a stacked `PriceDisplay`, and a `panel` holding a native `<select>` labelled "Delivered every" (so this task doesn't depend on Task 11).
  - **`KeyboardSelection` play test:**
    1. Tab to the checked radio, press ArrowDown.
    2. The next radio is checked and `args.onChange` was called with its value.
  - **`PanelOnlyForSelected` play test:**
    1. The select is absent while "One-time" is selected.
    2. Select "Subscribe"; the select appears.
    3. Tab reaches it; changing it leaves "Subscribe" checked (Review Focus 2).
  - **`RadioGroup.mdx`:** list vs card, panel rules, and the border rule.
- [ ] **Step 3: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 4: Commit:** `feat: RadioGroup with list and card appearances`

### Task 11: Select

**Files:**

- Create: `src/shared/components/Select/{Select.tsx,.style.ts,.type.ts,useSelect.ts,Select.stories.tsx,Select.mdx}`

**Interfaces:**

- **Consumes:** `useFormField`, `FormField` (Task 9), `Icon`.
- **Props:** `Select<TValue extends string>({ label, value, onChange, options, hint?, error?, layout = "stacked", className })`, with `options: { value: TValue; label: string }[]`.
- **Hook:** `useSelect` composes `useFormField` and maps the change event to `onChange(value as TValue)`.
- **Markup:** `<select>` with `appearance-none rounded-control border border-line bg-surface pr-9`, and a `chevron-down` `Icon` absolutely positioned and `pointer-events-none`.

- [ ] **Step 1: Build the hook and the component.**
- [ ] **Step 2: Write the stories.**
  - `Stacked`, `Inline` ("Delivered every" with 30/60/90 days) and `WithError`.
  - Play test: `getByLabelText("Delivered every")` is the select; `selectOptions` to "60 days" calls `args.onChange` with `"60"`.
  - Then update `RadioGroup`'s `Cards` story to use `Select` in the panel.
  - **`Select.mdx`.**
- [ ] **Step 3: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 4: Commit:** `feat: Select`

---

## PR 6 `feat/ui-stepper-dialog` (after PR 2)

### Task 12: ResponsiveDialog

**Files:**

- Create:
  - `src/shared/components/ResponsiveDialog/{ResponsiveDialog.tsx,.style.ts,.type.ts,useResponsiveDialog.ts,ResponsiveDialog.stories.tsx,ResponsiveDialog.mdx}`
  - `src/content/components/responsiveDialog.ts` (`closeLabel: "Close"`)

**Interfaces:**

- **Consumes:** `Button` (`size="icon"`, `variant="quiet"`) and `Icon` `close`.
- **Props:** `ResponsiveDialog({ open, onClose, title, description?, children, footer? })`.
- **Hook:** `useResponsiveDialog({ open, onClose })` returns `{ ref, titleId, descriptionId }`.
  - An effect calls `ref.current.showModal()` when `open` becomes true and `close()` when it becomes false.
  - It listens to the dialog's `cancel` event: `preventDefault()`, then `onClose()`, so the parent stays the source of truth.
  - It listens to `close` and calls `onClose()` if the parent still thinks it's open.
- **Markup:** `<dialog aria-labelledby={titleId} aria-describedby={descriptionId}>`, with a header (title as `h2` and the close button), a scrollable body, and a footer.
- **Styles:**
  - Below `sm`: `fixed inset-x-0 bottom-0 m-0 w-full max-w-none max-h-[85dvh] rounded-t-card pb-[env(safe-area-inset-bottom)]`.
  - From `sm`: `sm:m-auto sm:max-w-md sm:rounded-card`.
  - Backdrop: `backdrop:bg-fg/40`. An opacity fade on open, removed under reduced motion.

- [ ] **Step 1: Build the hook and the component.** jsdom lacks `showModal`, so behavior is proven in browser stories, not unit tests.
- [ ] **Step 2: Write the stories.** A story-local wrapper owns `open` state with a trigger `Button` "Skip next shipment" and footer buttons "Keep it" / "Skip shipment".
  - **`EscClosesAndReturnsFocus` play test:**
    1. Click the trigger; the dialog is open and `getByRole("dialog", { name: title })` is found.
    2. Press Escape; the dialog is closed, `onClose` was called once, and `document.activeElement` is the trigger.
    3. Click the trigger again; it opens again (Review Focus 3).
  - **`BottomSheetOnPhone` / `CenteredOnDesktop`:** after opening, assert `dialog.getBoundingClientRect().bottom` equals `window.innerHeight` at 375×812, and is less than `window.innerHeight` at 1280×800. Set the viewport with `page.viewport()` from `vitest/browser` inside the play function, or via story `globals.viewport` if addon-vitest applies it. The implementer reports which one worked.
  - **`ResponsiveDialog.mdx`:** use it only for confirmations and short multi-step flows; the footer button order puts the safe choice first.
- [ ] **Step 3: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 4: Commit:** `feat: ResponsiveDialog (bottom sheet on phones)`

### Task 13: QuantityStepper

**Files:**

- Create:
  - `src/shared/logic/quantity.ts`, `quantity.test.ts`
  - `src/shared/components/QuantityStepper/{QuantityStepper.tsx,.style.ts,.type.ts,useQuantityStepper.ts,QuantityStepper.stories.tsx,QuantityStepper.mdx}`
  - `src/content/components/quantityStepper.ts` (`decrease: "Decrease quantity"`, `increase: "Increase quantity"`)

**Interfaces:**

- **`clampQuantity(value: number, min: number, max: number): number`:** clamps and truncates to an integer. Examples: `(0, 1, 10)` → `1`, `(11, 1, 10)` → `10`, `(3.7, 1, 10)` → `3`.
- **`useQuantityStepper({ value, onChange, min, max })`:** returns `{ canDecrease, canIncrease, decrease, increase }`. `decrease` and `increase` call `onChange(clampQuantity(value ∓ 1, min, max))`.
- **`QuantityStepper({ value, onChange, min = 1, max = 10, label, labelHidden = false, className })`:**
  - `role="group"` with `aria-labelledby` pointing at the label.
  - Two `Button size="icon" variant="quiet"`, each with an `aria-label` from content, `disabled` at their bound.
  - The value sits in an `<output aria-live="polite">`.
  - The frame is `rounded-control border border-line` (faint allowed).

- [ ] **Step 1: Write the failing `quantity.test.ts`** with the three cases. Run and expect FAIL. Implement. Rerun: PASS.
- [ ] **Step 2: Build the hook and the component.**
- [ ] **Step 3: Write the stories.**
  - **`Bounds` play test:** start at 9 with max 10. Click increase; the output reads 10 and increase is disabled. Click decrease 9 times; it reads 1 and decrease is disabled. `onChange` was never called with a value below 1.
  - **`LabelHidden`:** Part B's look.
  - **`QuantityStepper.mdx`:** it never removes an item; removal is a separate, explicit action.
- [ ] **Step 4: Verify.** Run `corepack pnpm verify && corepack pnpm test:storybook`. Expected: exit 0.
- [ ] **Step 5: Commit:** `feat: QuantityStepper`

---

## Per-PR close-out (controller)

1. **Run the e2e suite:** `corepack pnpm test:e2e` exits 0.
2. **Final review** of the PR's range by the `reviewer` agent, then one fix wave and a scoped re-review.
3. **Open the PR:** push, open it with the PR template filled in, and watch CI (`check`, `e2e`, both Vercel previews).
4. **Check the Storybook preview** in a browser at 1280 and 375: every new docs page renders, the theme picker works, and the interaction stories pass in the CI log.
