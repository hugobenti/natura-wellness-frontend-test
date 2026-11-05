# Part A Subscription Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Hugo chose the execution method: **not subagent-driven**. One `task` agent (configured as `openai-codex/gpt-6-sol`) implements one PR at a time, task by task, with TDD and a commit per task. The controller (Opus) verifies each PR, opens it, and runs one whole-branch review at the end. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the "Manage my subscription" page in `src/part-a/SubscriptionCard.tsx`: the receipt at a glance, skipping the whole box (the real API), editing quantities and skipping one product, pausing, and the cancellation flow. Phone first, with two columns from `lg`.

**Architecture:**

- **Pure logic** in `src/part-a/logic`:
  - date math and formatting
  - pricing with cent allocation
  - deriving the view from the API snapshot plus a local overlay
  - edit drafts and pause presets
  - the overlay reducer
- **Hooks** own state and the API calls: `useSubscription` (load/reload), `useSkipFlow`, `useEditMode`, `usePauseFlow`, and `useSubscriptionCard`, which composes them into one view model.
- **Presentation-only components** in `src/part-a/components` render that model using the shared components.

**Tech stack:** React 19, TypeScript ~6.0, Tailwind v4 (tokens only), Vitest 5.1 + Testing Library (`renderHook`), pnpm via `corepack pnpm`. No Playwright e2e for now (Hugo's call): unit and hook tests only.

**Spec:** `docs/superpowers/specs/2026-11-05-subscription-page-design.md` (approved). Read it before starting; this plan argues from it.

## PRs and tasks

Branches are stacked: each PR's base is the previous PR's branch, and #1's base is `main`. Hugo squash-merges in order; the controller rebases the rest after each merge (`git rebase --onto <new base> <old base sha>`). Work happens in one worktree, `~/Projects/natura-wellness-frontend-test-worktrees/feat-part-a`.

| PR  | Branch                 | Tasks                                                                      | Delivers                                                                     | ~Files |
| --- | ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| 1   | `feat/part-a-logic`    | 1. Dates and pricing · 2. Subscription view derivation                     | Tested pure logic, no UI                                                     | 9      |
| 2   | `feat/part-a-overview` | 3. Load hook · 4. Read-only page, responsive layout                        | At a glance for all four fixtures, loading and load-error states             | 19     |
| 3   | `feat/part-a-skip`     | 5. Skip flow hook · 6. Skip sheet, notices, Manage panel                   | Skip the whole box over the real API, including 409 and errors               | 12     |
| 4   | `feat/part-a-edit`     | 7. Edit draft and overlay reducer · 8. Edit mode UI                        | Quantities, skip one product, Save/Cancel                                    | 12     |
| 5   | `feat/part-a-pause`    | 9. Pause logic and local skip routing · 10. Pause sheet and paused actions | Pause with a duration, change pause, resume, local skip after a local resume | 12     |
| 6   | `feat/part-a-cancel`   | 11. Cancel flow                                                            | Before you cancel, cancel, survey, cancelled page, AGENTS map                | 14     |

Every PR ends with the same gate before the controller pushes:

- `corepack pnpm verify` exits 0
- `corepack pnpm test` passes (part of `verify`; named here because it's the only automated proof)
- the controller checks the PR's views in a browser at 375px and 1200px

## Global Constraints

- **Repo rules (`AGENTS.md`), all enforced by ESLint:**
  - `.tsx` files are presentation only. No arithmetic, template literals with expressions, helper functions, `.filter/.join/…`, or calls in JSX other than `cx()`. Every string and number a component shows arrives formatted from its hook.
  - Classes live in `X.style.ts` (plain strings or `cx()` of strings); `.tsx` composes them with `cx()`.
  - Every type lives in `X.type.ts` next to its user. Interfaces are prefixed `I`, type aliases `T`. The API's own types keep their names.
  - All UI copy lives in `src/content/subscription.ts`. It may export functions that build strings, e.g. `charged: (date: string) => \`Charged ${date}\``.
  - Tokens only:
    - text sizes: `text-title|section|body|small|eyebrow`
    - radii: `rounded-control|card|pill`, plus `rounded-full` for circles
    - colors: semantic utilities only (`bg-surface`, `border-line`, `text-muted`…); no primitives, no raw colors
  - Control borders follow the rule: `border-line` for text+icon controls, `border-control-line` for radio circles and inputs, `border-accent` for a selected card. Never remove the focus outline.
  - `cx()` doesn't merge classes, so `base` never holds a property that a variant changes.
  - Status always shows as an icon plus a word: use `StatusBadge`.
- **Boundaries:** `src/part-a` may import `src/api`, `src/shared`, `src/content`, `src/styles`, but never `src/part-b` or `src/app`. Never edit `src/api/**` or `INSTRUCTIONS.md`.
- **Shared components to use as they are:**
  - `Button` (`variant: primary|secondary|quiet|destructive`, `size: md|lg|icon`, `fullWidth`, `pending`)
  - `StatusBadge` (`status`)
  - `Badge` (`tone: highlight|active|paused|cancelled|danger`)
  - `Alert` (`tone: success|info|danger`, `title`, `children`, `action`)
  - `ProductThumbnail` (`src`, `name`, `size`, `decorative`)
  - `PriceDisplay` (`amountCents`, `compareAtCents`, `size: sm|md|lg`, `layout: inline|stacked`)
  - `QuantityStepper` (`value`, `onChange`, `min`, `max`, `label`, `labelHidden`)
  - `RadioGroup` (`legend`, `legendHidden`, `name`, `value`, `onChange`, `appearance: list|card`, `options`)
  - `ResponsiveDialog` (`open`, `onClose`, `title`, `description`, `children`, `footer`)
  - `Icon`, plus `formatMoney`, `clampQuantity` and `cx`

  A shared component that needs a change gets the smallest change, with its story updated, in the PR that needs it.

- **Money:** reuse `totalAfterDiscount` from `@/api/fixtures`. Cents are integers everywhere; `formatMoney` only at the edge, in hooks.
- **Dates:** ISO strings everywhere. Logic takes `now: Date` as a parameter (never reads the clock); hooks pass `new Date()`. `DAY_MS = 86_400_000`, as in the API.
- **Copy rule from the spec:** a crossed-out amount always means "price before the subscription discount". The skip sheet's crossed-out old date is the spec's one explicit exception (decision 8).
- **Tests:** new logic gets a failing test first. Hook tests mock the API with `vi.mock("@/api/mockApi")`, because the real module reads `window.location` at import. Nothing gets a test that only pins copy or class strings.
- **Commits:** one per task, Conventional Commits, no AI attribution.

## Review Focus

1. **A double tap on "Skip this box" while the request is pending must send exactly one request.** Escape and the close button must not dismiss the sheet mid-request. Owned by Task 5 (`confirm twice while pending calls the API once`, `close is ignored while pending`).
2. **A 409 whose reload also fails must not leave the sheet spinning.** It lands in the error state with Try again. A reload that reveals a paused or cancelled subscription closes the sheet. Owned by Task 5.
3. **On the paused fixture, after "Resume now", skipping must not hit the API.** The API would answer 400. It must move the date locally. Owned by Task 9 (`skipIsLocal` derivation, the `skipLocally` reducer, and `useSkipFlow`'s local branch).
4. **Local edits must survive a snapshot replacement.** After a whole-box skip or a 409 reload, quantities stay; per-product skips clear only when the box moves (whole-box skip, or a reload that moved `nextChargeAt`). Owned by Task 2 (derivation over a new snapshot) and Task 7 (`clearSkipped`).
5. **Dates across a year boundary or near midnight** must show the year when it differs ("Mon, Jan 4, 2027") and use the user's timezone, not UTC. Owned by Task 1.
6. **A slow load followed by "Try again" must not let the older response overwrite the newer one.** Owned by Task 3 (`stale response is ignored`).

---

## PR 1 · `feat/part-a-logic`

Create the worktree from an up-to-date `main` (`git fetch`, then `git worktree add -b feat/part-a-logic ../natura-wellness-frontend-test-worktrees/feat-part-a origin/main`, then `corepack pnpm install`).

The controller then copies the spec and this plan into the worktree and commits them as the PR's first commit: `docs: part A subscription page design and plan`.

### Task 1: Dates and pricing

**Files:**

- Create: `src/part-a/logic/dates.ts`, `src/part-a/logic/dates.type.ts`, `src/part-a/logic/dates.test.ts`
- Create: `src/part-a/logic/pricing.ts`, `src/part-a/logic/pricing.type.ts`, `src/part-a/logic/pricing.test.ts`

**Interfaces:**

- **Produces, dates:**
  - `addDays(iso: string, days: number): string`, which returns ISO
  - `formatDay(iso: string, now: Date, options?: IFormatDayOptions): string`, where `IFormatDayOptions { locale?: string; timeZone?: string }`
- **Produces, pricing:** `priceBox(items: ReadonlyArray<SubscriptionItem>, discountPercent: number): IBoxPricing`, where
  - `IBoxPricing { lines: IPricedLine[]; subtotalCents: number; totalCents: number; savingCents: number }`
  - `IPricedLine { sku: string; priceCents: number; compareAtCents: number }`

- [ ] **Step 1: Write the failing date tests** in `dates.test.ts`:
  - `addDays("2026-11-11T12:00:00.000Z", 30)` → `"2026-12-11T12:00:00.000Z"`
  - `formatDay("2026-11-11T12:00:00.000Z", new Date("2026-11-05T12:00:00Z"), { locale: "en-US", timeZone: "UTC" })` → `"Wed, Nov 11"`
  - Year shown when it differs from `now`'s year in the same timezone: `formatDay("2027-01-04T12:00:00.000Z", now, { locale: "en-US", timeZone: "UTC" })` → `"Mon, Jan 4, 2027"`
  - Timezone respected: `formatDay("2026-11-11T02:00:00.000Z", now, { locale: "en-US", timeZone: "America/New_York" })` → `"Tue, Nov 10"`
- [ ] **Step 2:** `corepack pnpm vitest run --project unit src/part-a/logic/dates.test.ts` → FAIL (module not found).
- [ ] **Step 3: Implement `dates.ts`.**
  - `addDays` uses `Date.parse` plus `days * DAY_MS`, then `toISOString()`.
  - `formatDay` uses `Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone })`, adding `year: "numeric"` only when the date's year differs from `now`'s year. Compare years with the same `timeZone`, via `formatToParts`.
  - `locale` and `timeZone` default to `undefined`, meaning the user's own.
- [ ] **Step 4:** rerun → PASS.
- [ ] **Step 5: Write the failing pricing tests** in `pricing.test.ts`. Use the fixture items, Vitamin D ×1 at 2995 and Multivitamin ×2 at 4495, with discount 15:
  - `subtotalCents` 11985, `totalCents` 10187 (equals `totalAfterDiscount`), `savingCents` 1798
  - lines `[{ sku: "NW-VITD-60", priceCents: 2546, compareAtCents: 2995 }, { sku: "NW-MULTI-30", priceCents: 7641, compareAtCents: 8990 }]`
  - **Invariant:** for every combination of quantities 1–5 over the three single products in `catalog`, `sum(lines.priceCents) === totalCents`
  - `priceBox([], 15)` → all zeros, `lines: []`
  - discount 0 → each `priceCents === compareAtCents`
- [ ] **Step 6:** run → FAIL.
- [ ] **Step 7: Implement `priceBox`.**
  - `compareAtCents = unitPriceCents * quantity`
  - `totalCents = totalAfterDiscount(items, discountPercent)`
  - Line prices use the largest remainder method:

```ts
// exact = compareAt * (100 - d) / 100; floor each; hand the leftover cents (total - Σfloor)
// one by one to the lines with the largest fractional part (ties: earlier line first).
```

- [ ] **Step 8:** rerun → PASS.
- [ ] **Step 9: Commit:** `feat(part-a): date formatting and box pricing with exact cent allocation`.

### Task 2: Subscription view derivation

**Files:**

- Create: `src/part-a/logic/subscriptionView.ts`, `src/part-a/logic/subscriptionView.type.ts`, `src/part-a/logic/subscriptionView.test.ts`

**Interfaces:**

- **Consumes:** `priceBox`, `IBoxPricing` (Task 1).
- **Produces:**
  - `TLifecycleOverride = { status: "active"; nextChargeAt: string } | { status: "paused"; pausedUntil: string | null } | { status: "cancelled"; cancelledAt: string }`
  - `ILocalOverlay { quantities: Readonly<Record<string, number>>; skippedSkus: readonly string[]; lifecycle: TLifecycleOverride | null }`
  - `EMPTY_OVERLAY: ILocalOverlay`
  - `IViewLine { sku: string; name: string; imageUrl: string | null; quantity: number; skipped: boolean; priceCents: number | null; compareAtCents: number | null }`, where both prices are `null` when skipped
  - `ISubscriptionView { id: string; updatedAt: string; status: SubscriptionStatus; nextChargeAt: string | null; pausedUntil: string | null; cancelledAt: string | null; intervalDays: number; discountPercent: number; lines: IViewLine[]; pricing: IBoxPricing; skipIsLocal: boolean }`
  - `deriveView(snapshot: Subscription, overlay: ILocalOverlay): ISubscriptionView`

- [ ] **Step 1: Write the failing tests.** Build snapshots with `fixtures.active()`, `fixtures.paused()` and `fixtures.cancelled()` from `@/api/fixtures`.
  - `EMPTY_OVERLAY on active matches the API`: `pricing.totalCents === snapshot.nextChargeTotalCents` (10187); `status "active"`; `skipIsLocal false`.
  - `quantities override the snapshot`: `{ "NW-MULTI-30": 3 }` → that line's quantity is 3 and `pricing.totalCents === 14008` (Vitamin D 2995 + Multivitamin 3 × 4495 = 16480, less 15%).
  - `a skipped line is excluded and unpriced`: `skippedSkus: ["NW-VITD-60"]` → that line has `skipped: true` and `priceCents: null`, and `pricing.totalCents === 7642` (Math.round of 8990 × 0.85 = 7641.5).
  - `skips are ignored unless active`: the paused fixture with `skippedSkus` → no line skipped.
  - `paused override`: the active snapshot with `{ status: "paused", pausedUntil: null }` → `status "paused"`, `nextChargeAt null`, `pausedUntil null`, `skipIsLocal true`.
  - `active override on the paused fixture`: `{ status: "active", nextChargeAt: X }` → `status "active"`, `nextChargeAt X`, `pausedUntil null`.
  - `cancelled override`: `cancelledAt` comes from the override and `nextChargeAt` is null.
  - **Review Focus 4:** `a new snapshot keeps overlay quantities`. Derive with a snapshot whose `nextChargeAt` moved by 30 days and an overlay `{ quantities: { "NW-MULTI-30": 3 } }` → the new date, and quantity 3.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement `deriveView`.**
  - The lifecycle override wins for `status`, `nextChargeAt`, `pausedUntil` and `cancelledAt`; fields the override doesn't set are `null`.
  - `skippedSkus` apply only when the derived status is `"active"`.
  - `pricing = priceBox(unskipped lines with overlay quantities, discountPercent)`.
  - `skipIsLocal = overlay.lifecycle !== null`.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5: Commit:** `feat(part-a): derive the subscription view from snapshot and local overlay`.

**PR 1 gate:** `verify`. Title: `feat(part-a): pricing, dates and view derivation`.

---

## PR 2 · `feat/part-a-overview` (base `feat/part-a-logic`)

### Task 3: Load hook

**Files:**

- Create: `src/part-a/hooks/useSubscription.ts`, `useSubscription.type.ts`, `useSubscription.test.ts` (all in `src/part-a/hooks/`)

**Interfaces:**

- **Produces:**
  - `TLoadState = { status: "loading" } | { status: "error" } | { status: "ready"; snapshot: Subscription }`
  - `useSubscription(): { state: TLoadState; retry: () => void; reload: () => Promise<Subscription | null>; replace: (snapshot: Subscription) => void }`
  - `retry` goes back to `loading`, for the error screen. `reload` keeps the current state while it fetches; it resolves the fresh snapshot (and sets it) or `null` on failure (keeping the old snapshot). `replace` sets a snapshot that came from `skipNextShipment`.

- [ ] **Step 1: Write the failing tests** (`renderHook`, `vi.mock("@/api/mockApi")`, controllable deferred promises):
  - `loads into ready`
  - `a rejected load is error, and retry goes loading → ready`
  - `reload while ready keeps ready and resolves the fresh snapshot`
  - `failed reload resolves null and keeps the old snapshot`
  - **Review Focus 6:** `stale response is ignored`. The first `getSubscription` is still pending, `retry` starts a second, the second resolves (A), then the first resolves (B) → the state holds A. Use a request counter ref.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.** One `useEffect` triggers the initial load; set state only if the request id is still the latest.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5: Commit:** `feat(part-a): subscription load hook with retry and reload`.

### Task 4: Read-only page and responsive layout

**Files:**

- Modify: `src/part-a/SubscriptionCard.tsx` (keep the path and export name)
- Create: `src/part-a/SubscriptionCard.style.ts`, `SubscriptionCard.type.ts`, `useSubscriptionCard.ts`
- Create: `src/part-a/components/ReceiptCard/{ReceiptCard.tsx,ReceiptCard.style.ts,ReceiptCard.type.ts}`
- Create: `src/part-a/components/ReceiptSkeleton/{ReceiptSkeleton.tsx,ReceiptSkeleton.style.ts}`
- Create: `src/part-a/components/SupportLink/{SupportLink.tsx,SupportLink.style.ts}`
- Modify: `src/content/subscription.ts`
- Create: `src/part-a/useSubscriptionCard.test.ts`

**Interfaces:**

- **Consumes:** `useSubscription` (Task 3), `deriveView`, `EMPTY_OVERLAY` (Task 2), `formatDay` (Task 1), `formatMoney`.
- **Produces:**
  - **`IReceiptLineModel`:**
    - `sku: string`
    - `name: string`
    - `imageUrl: string | null`
    - `quantityLabel: string`
    - `priceCents: number | null`
    - `compareAtCents: number | null`
  - **`TReceiptFooter`:**
    - `{ kind: "charge"; label: string; sublabel: string; totalCents: number; compareAtCents: number; savingLabel: string }`
    - `{ kind: "note"; label: string; sublabel: string | null }`
  - **`IReceiptCardProps`:**
    - `heading: string`
    - `status: SubscriptionStatus`
    - `dimmed: boolean`
    - `lines: IReceiptLineModel[]`
    - `footer: TReceiptFooter`
    - `headingRef?: Ref<HTMLHeadingElement>`
  - **`useSubscriptionCard()`** returns `TPageModel = { kind: "loading" } | { kind: "error"; onRetry: () => void } | { kind: "ready"; receipt: IReceiptCardProps }`. Later tasks add fields to the `ready` model; the type lives in `SubscriptionCard.type.ts`.
  - **`SupportLink`** is an `<a href={subscriptionContent.support.href}>` styled with the shared quiet-button classes. Import `button` from `@/shared/components/Button/Button.style` into `SupportLink.style.ts` and compose with `cx(button.base, button.variant.quiet, button.size.md)`.

- [ ] **Step 1: Copy.** Replace `src/content/subscription.ts` with the block below. Later tasks add keys and never rename these.

```ts
export const subscriptionContent = {
  title: "My subscription",
  loading: "Loading your subscription…",
  loadError: {
    title: "We couldn't load your subscription",
    body: "Please try again, or contact support.",
    retry: "Try again",
  },
  support: {
    label: "Contact support",
    href: "mailto:support@naturawellness.example?subject=My%20subscription",
  },
  receipt: {
    headingActive: "Next box",
    headingPaused: (date: string) => `Paused until ${date}`,
    headingPausedOpen: "Paused until you resume",
    headingCancelled: (date: string) => `Cancelled on ${date}`,
    quantity: (quantity: number) => `Qty ${quantity}`,
    charged: (date: string) => `Charged ${date}`,
    every: (days: number) => `Every ${days} days`,
    saving: (amount: string) => `You save ${amount}`,
    pausedTotal: "No charges while paused",
    pausedNext: (date: string, amount: string) => `Your next box: ${date} · ${amount}`,
    pausedOpenNext: "Resume any time to restart your boxes",
    cancelledTotal: "No more charges",
  },
} as const;
```

- [ ] **Step 2: Write the failing tests** in `useSubscriptionCard.test.ts` (`renderHook`, `vi.mock("@/api/mockApi")` resolving `fixtures.active()`, `fixtures.paused()` or `fixtures.cancelled()`, or rejecting):
  - `active maps to the receipt at a glance`: `kind "ready"`; heading "Next box"; two lines with `quantityLabel` "Qty 1" and "Qty 2"; footer `kind "charge"` with `totalCents 10187`, `compareAtCents 11985`, `savingLabel "You save $17.98"`; `dimmed false`.
  - `paused maps to a dimmed note`: the heading starts with "Paused until"; footer `kind "note"` with `label "No charges while paused"`; `dimmed true`.
  - `cancelled maps to a note without a total`: the heading starts with "Cancelled on"; footer label "No more charges".
  - `load error maps to error, and onRetry goes back to loading`.
- [ ] **Step 3:** `corepack pnpm vitest run --project unit src/part-a/useSubscriptionCard.test.ts` → FAIL.
- [ ] **Step 4: Implement `useSubscriptionCard`.**
  - Map `TLoadState` to `TPageModel`. The `ready` model is `deriveView(snapshot, EMPTY_OVERLAY)` mapped to `IReceiptCardProps` with `formatDay(iso, new Date())` and `formatMoney`.
  - Heading:
    - active: `headingActive`
    - paused: `headingPaused(date)`, or `headingPausedOpen` when `pausedUntil` is null
    - cancelled: `headingCancelled(date)`
  - Footer:
    - active: `charge`, with `charged(date)`, `every(intervalDays)`, total and subtotal, and `saving(formatMoney(savingCents))`
    - paused: `note`, with `pausedTotal` and `pausedNext(date, amount)` (or `pausedOpenNext`)
    - cancelled: `note`, with `cancelledTotal` and `null`
  - `dimmed` is true only when paused.
- [ ] **Step 5: Implement the components.**
  - **`ReceiptCard`** renders:
    - a header with the heading as an `<h2>` styled `text-eyebrow` (it takes `headingRef` and `tabIndex={-1}`) and `StatusBadge`
    - one row per line: `ProductThumbnail size md decorative`, the name, the quantity label, and `PriceDisplay layout="stacked"`; skip the price when `priceCents` is null
    - the footer row: `PriceDisplay size="lg" layout="stacked"` with `compareAtCents`, plus `Badge tone="highlight"` for the saving; or the note
    - Dimmed rows use opacity only.
  - **`ReceiptSkeleton`** is a static block layout in `bg-fill-soft`, with no animation, plus the visible `loading` text, inside a container with `role="status"`.
  - **`SubscriptionCard`** renders an `<h1>` `title`, then the loading, error (`Alert tone="danger"` with a "Try again" `Button variant="quiet"` as `action` and `SupportLink` in its children) or ready view.
- [ ] **Step 6: Layout in `SubscriptionCard.style.ts`.** Spacing values come from spec decision 3.
  - **Page:** `mx-auto w-full max-w-[560px] px-4 pt-6 pb-8 lg:max-w-[1072px] lg:px-0 lg:pt-12`.
  - **Title:** 24px under it (`mb-6`).
  - **Ready grid:** `lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8`. The receipt is in column 1; column 2 is reserved for the Manage panel (Task 6).
  - **Card insets** 16px, **row padding** 16px, **thumbnail–text gap** 12px, thumbnail 56px.
  - **From `lg`,** product rows become `grid-cols-[56px_minmax(0,1fr)_96px_120px]` (name · quantity · price). On a phone the quantity sits under the name.
- [ ] **Step 7:** rerun the tests → PASS.
- [ ] **Step 8: Commit:** `feat(part-a): read-only receipt page with loading, error and responsive layout`.

**PR 2 gate:** `verify`. The controller screenshots active, paused, cancelled and error at 375 and 1200. Title: `feat(part-a): subscription at a glance`.

---

## PR 3 · `feat/part-a-skip` (base `feat/part-a-overview`)

### Task 5: Skip flow hook

**Files:**

- Create: `src/part-a/hooks/useSkipFlow.ts`, `useSkipFlow.type.ts`, `useSkipFlow.test.ts`
- Create: `src/part-a/hooks/notice.type.ts`

**Interfaces:**

- **Consumes:** `ISubscriptionView` (Task 2); `reload` and `replace` from `useSubscription` (Task 3); `skipNextShipment`, `ApiError`.
- **Produces:**
  - `INotice { tone: "success" | "info" | "danger"; title: string; body: string }`
  - `TSkipPhase = "confirm" | "pending" | "conflict" | "error"`
  - `useSkipFlow(args: IUseSkipFlowArgs): { phase: TSkipPhase | null; open: () => void; close: () => void; confirm: () => Promise<void> }`, where `phase` is `null` when the sheet is closed
  - `IUseSkipFlowArgs { view: ISubscriptionView; reload: () => Promise<Subscription | null>; onSkipped: (snapshot: Subscription) => void; notify: (notice: INotice) => void }`

- [ ] **Step 1: Write the failing tests** (mock `skipNextShipment`, build `view` with `deriveView(fixtures.active(), EMPTY_OVERLAY)`):
  - `success calls the API once with id and updatedAt, calls onSkipped, closes, and notifies success`. The notice body contains the new date and amount (assert `notify` was called with `tone: "success"`).
  - **Review Focus 1:** `confirm twice while pending calls the API once`
  - **Review Focus 1:** `close is ignored while pending`
  - `409 reloads and moves to conflict`: `reload` resolves an active snapshot → phase `"conflict"`.
  - **Review Focus 2:** `409 with a failed reload moves to error`
  - **Review Focus 2:** `409 whose reload is paused closes and notifies info`
  - `400 behaves like 409`
  - `500 moves to error; confirm again retries` (the second call happens)
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.**
  - Guard against re-entry with a `pendingRef`.
  - A 409 or 400 `ApiError` → `reload()`:
    - `null` → `"error"`
    - fresh status not `"active"` → close, then `notify({ tone: "info", … })`
    - otherwise → `"conflict"`
  - Any other error → `"error"`.
  - On success: `onSkipped(snapshot)`, then close, then `notify` the success notice (from the returned snapshot: `formatDay(nextChargeAt)` and `formatMoney(nextChargeTotalCents)`, the latter overridden in Task 8 to include local quantities).
  - The copy comes from the Task 6 content keys; add them in this task's commit.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5: Commit:** `feat(part-a): skip flow with conflict reload and pending guard`.

### Task 6: Skip sheet, notices and the Manage panel

**Files:**

- Create: `src/part-a/components/SkipSheet/{SkipSheet.tsx,SkipSheet.style.ts,SkipSheet.type.ts}`
- Create: `src/part-a/components/ManagePanel/{ManagePanel.tsx,ManagePanel.style.ts,ManagePanel.type.ts}`
- Modify: `useSubscriptionCard.ts`, `SubscriptionCard.tsx`, `SubscriptionCard.type.ts`, `src/content/subscription.ts`
- Modify: `src/part-a/useSubscriptionCard.test.ts`

**Interfaces:**

- **Consumes:** `useSkipFlow`, `INotice` (Task 5).
- **Produces:**
  - **`ISkipSheetProps`:**
    - `open: boolean`
    - `phase: TSkipPhase`
    - `oldDate: string`
    - `newDate: string`
    - `amount: string`
    - `onConfirm: () => void`
    - `onClose: () => void`
  - **`IManagePanelProps`:** `{ children: ReactNode }`. It renders an `<h2>` "Manage", visible from `lg` and `sr-only` below that.
  - **The `ready` model gains:**
    - `notice: INotice | null`
    - `skipSheet: ISkipSheetProps`
    - `actions: IManageAction[]`, where `IManageAction { key: string; label: string; variant: "primary" | "secondary" | "quiet"; onClick: () => void; ref?: Ref<HTMLButtonElement> }`
    - In this PR, active has `[skip]`, and paused and cancelled have `[]`. A cancelled subscription renders no panel at all.

- [ ] **Step 1: Copy.** Add to `subscriptionContent`:

```ts
manage: { heading: "Manage", skip: "Skip the whole box" },
skip: {
  title: "Skip your next box?",
  nextBox: "Next box",
  chargedOn: (date: string) => `Charged on ${date}`,
  nothingOn: (date: string) => `Nothing is sent or charged on ${date}.`,
  confirm: "Skip this box",
  pending: "Skipping…",
  retry: "Try again",
  keep: "Keep my box",
  conflictTitle: "Your subscription changed somewhere else",
  conflictBody: "We loaded the latest version below. Check it and confirm again.",
  errorTitle: "We couldn't skip your box",
  errorBody: (date: string) => `Nothing changed: you'll still be charged on ${date}. Try again, or contact support.`,
  successTitle: "Next box skipped",
  successBody: (amount: string, date: string) => `Your next charge is ${amount} on ${date}.`,
  changedTitle: "Your subscription changed somewhere else",
  changedBody: "We loaded the latest version.",
},
```

- [ ] **Step 2: Write the failing tests** in `useSubscriptionCard.test.ts`:
  - `active offers the skip action; paused and cancelled offer none`. Assert on `actions` keys.
  - `the skip sheet shows the old date, the date one interval later, and the amount without per-product skips`: `newDate === formatDay(addDays(nextChargeAt, 30))` and `amount === "$101.87"`.
  - `a skip success replaces the snapshot and sets the success notice`: mock `skipNextShipment` to resolve the active fixture with `nextChargeAt` moved 30 days → after `confirm`, `notice.title === "Next box skipped"`, and the receipt footer label carries the new date.
- [ ] **Step 3:** run → FAIL.
- [ ] **Step 4: Implement.**
  - **The sheet**, inside `ResponsiveDialog title={skip.title}`:
    - A facts list (`<dl>`): "Next box", then `<s>{oldDate}</s>` → `<strong>{newDate}</strong>`; then "Charged on {newDate}" with the amount.
    - The `nothingOn` note.
    - The conflict alert (`Alert tone="info"`) or the error alert (`Alert tone="danger"`, with `SupportLink` in its children).
    - Footer:
      - the primary `Button fullWidth`: `confirm` or `retry`, with `pending` and the `pending` label while pending
      - the secondary `keep`
  - **Passing `onClose`:** pass the flow's `close`, which already ignores calls while pending.
  - **`newDate`** = `formatDay(addDays(view.nextChargeAt, view.intervalDays))`. **`amount`** = the next box's total with skips cleared: `deriveView(snapshot, { ...overlay, skippedSkus: [] }).pricing.totalCents`.
  - **The notice** renders as `Alert` above the receipt, in the grid's column 1. A new notice replaces the old one.
  - **`ManagePanel`** is column 2 from `lg`: `lg:sticky lg:top-6 lg:rounded-card lg:border lg:border-line lg:bg-surface lg:p-6`. On a phone it's a plain stack of buttons, 16px under the card, 12px apart. Actions are `fullWidth` at `size="lg"`.
- [ ] **Step 5:** rerun the tests → PASS.
- [ ] **Step 6: Commit:** `feat(part-a): skip the whole box with confirmation, pending, conflict and error states`.

**PR 3 gate:** `verify`. The controller checks the sheet at 375 (bottom sheet) and 1200 (modal) in every phase, using `&conflict=always` and `&conflict=never`. Title: `feat(part-a): skip the whole box`.

---

## PR 4 · `feat/part-a-edit` (base `feat/part-a-skip`)

### Task 7: Edit draft and overlay reducer

**Files:**

- Create: `src/part-a/logic/editDraft.ts`, `editDraft.type.ts`, `editDraft.test.ts`
- Create: `src/part-a/logic/overlay.ts`, `overlay.type.ts`, `overlay.test.ts`

**Interfaces:**

- **Consumes:** `ILocalOverlay`, `EMPTY_OVERLAY` (Task 2), `clampQuantity`.
- **Produces, edit drafts:**
  - `IEditDraft { quantities: Record<string, number>; skippedSkus: string[] }`
  - `MAX_QUANTITY = 10`
  - `startDraft(overlay: ILocalOverlay): IEditDraft`
  - `setDraftQuantity(draft: IEditDraft, sku: string, quantity: number): IEditDraft`, which clamps to 1…`MAX_QUANTITY`
  - `toggleDraftSkip(draft: IEditDraft, sku: string, allSkus: readonly string[]): IEditDraft`
  - `canSkip(draft: IEditDraft, sku: string, allSkus: readonly string[]): boolean`
- **Produces, overlay:**
  - `TOverlayAction = { type: "saveEdits"; draft: IEditDraft } | { type: "clearSkipped" }`, extended in Tasks 9 and 11
  - `overlayReducer(overlay: ILocalOverlay, action: TOverlayAction): ILocalOverlay`

- [ ] **Step 1: Write the failing tests:**
  - `setDraftQuantity clamps to 1..10` (0 → 1, 11 → 10)
  - `toggleDraftSkip skips then unskips`
  - `the last unskipped product cannot be skipped`: with two SKUs, skipping both leaves one skipped, and `canSkip` is false for the remaining one
  - `saveEdits replaces quantities and skippedSkus`
  - **Review Focus 4:** `clearSkipped keeps quantities`
  - `reducer returns a new object` (immutability)
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5: Commit:** `feat(part-a): edit drafts and the local overlay reducer`.

### Task 8: Edit mode UI

**Files:**

- Create: `src/part-a/hooks/useEditMode.ts`, `useEditMode.type.ts`
- Create: `src/part-a/hooks/useEditMode.test.ts`
- Modify: `ReceiptCard.tsx`, `ReceiptCard.style.ts`, `ReceiptCard.type.ts`, `useSubscriptionCard.ts`, `SubscriptionCard.type.ts`, `src/content/subscription.ts`

**Interfaces:**

- **Consumes:** Task 7 (`startDraft`, `setDraftQuantity`, `toggleDraftSkip`, `canSkip`, `overlayReducer`), `deriveView`.
- **Produces:**
  - **`useEditMode({ overlay, snapshot, dispatch, notify })`** returns:
    - `editing: boolean`
    - `draftView: ISubscriptionView | null`
    - `start()`, `save()`, `cancel()`
    - `setQuantity(sku, quantity)`, `toggleSkip(sku)`
    - `headingRef`, `editButtonRef`
  - **`IReceiptLineModel` gains `edit?: IReceiptLineEdit`**, where `IReceiptLineEdit` has:
    - `quantity: number`
    - `onQuantityChange: (quantity: number) => void`
    - `stepperLabel: string`
    - `skip: { label: string; onClick: () => void } | null`
    - `undo: { label: string; onClick: () => void } | null`
    - `skippedNote: string | null`
    - `lastItemHint: string | null`
  - **`TReceiptFooter` gains** `{ kind: "draft"; label: string; sublabel: string; totalCents: number; compareAtCents: number; savingLabel: string }`.

- [ ] **Step 1: Copy.** Add:

```ts
manage: { …, edit: "Edit products", save: "Save changes", cancelEdit: "Cancel" },
edit: {
  heading: "Editing next box",
  stepperLabel: (name: string) => `Quantity of ${name}`,
  skipOnce: "Skip once",
  skipOnceLabel: (name: string) => `Skip ${name} once`,
  undo: "Undo",
  undoLabel: (name: string) => `Undo skipping ${name}`,
  skippedNote: "Skipped in the next box only",
  lastItemHint: "To skip everything, use Skip the whole box",
  newTotal: "New total",
  currently: (amount: string) => `Currently ${amount}`,
  savedTitle: "Changes saved",
  savedBody: (amount: string, date: string) => `Your next box: ${amount} on ${date}.`,
},
```

- [ ] **Step 2: Write the failing tests** in `useEditMode.test.ts` (`renderHook` over the active fixture snapshot, `EMPTY_OVERLAY`, and spies for `dispatch` and `notify`):
  - `start opens a draft of the committed overlay`: `editing true`, and `draftView.pricing.totalCents === 10187`.
  - `setQuantity updates the draft total live`: Multivitamin to 3 → `draftView.pricing.totalCents === 14008`, while `dispatch` hasn't been called.
  - `save dispatches saveEdits and notifies Changes saved`: `editing false`; `dispatch` called with `{ type: "saveEdits", draft }`; the notice title is "Changes saved".
  - `cancel discards the draft`: `editing false`, and `dispatch` not called.
  - `toggleSkip excludes a product and toggling again restores it`.
  - `the last product cannot be skipped`: after skipping Vitamin D, `toggleSkip("NW-MULTI-30")` leaves the draft unchanged.
- [ ] **Step 3:** run → FAIL.
- [ ] **Step 4: Implement.**
  - **Action area while editing:** `[save (primary), cancelEdit (secondary)]`. While active and not editing: `[edit, skip]`, in spec order.
  - **Skipped row:** no price (anti-goal: a crossed-out amount only ever means "before discount"). It shows `skippedNote` and an Undo `Button variant="quiet"`.
  - **Steppers:** `QuantityStepper min={1} max={MAX_QUANTITY} labelHidden`.
  - **Focus:** focus `headingRef` after `start()`, and `editButtonRef` after `save()` or `cancel()`. Use an effect keyed on `editing`.
  - **Whole-box skip interaction:** `useSkipFlow`'s `onSkipped` now also dispatches `clearSkipped`, and the success amount comes from `deriveView(snapshot, overlay after clearSkipped)`.
- [ ] **Step 5:** rerun the tests → PASS.
- [ ] **Step 6: Commit:** `feat(part-a): edit quantities and skip one product`.

**PR 4 gate:** `verify`. The controller checks edit mode at 375 (steppers fit under the name with no overflow) and 1200. Title: `feat(part-a): edit products`.

---

## PR 5 · `feat/part-a-pause` (base `feat/part-a-edit`)

### Task 9: Pause logic and local skip routing

**Files:**

- Create: `src/part-a/logic/pause.ts`, `pause.type.ts`, `pause.test.ts`
- Modify: `overlay.ts`, `overlay.type.ts`, `overlay.test.ts`, `subscriptionView.type.ts` (paused override gains `presetId`), `subscriptionView.test.ts` (paused overrides gain `presetId: null`)
- Modify: `useSkipFlow.ts`, `useSkipFlow.test.ts`

**Interfaces:**

- **Produces, pause:**
  - `TPausePresetId = "1m" | "2m" | "3m" | "open"`
  - `PAUSE_PRESETS: ReadonlyArray<{ id: TPausePresetId; days: number | null }>` = `[{ id: "1m", days: 30 }, { id: "2m", days: 60 }, { id: "3m", days: 90 }, { id: "open", days: null }]`
  - `pauseUntil(presetId: TPausePresetId, now: Date): string | null`
  - `resumeChargeAt(now: Date): string`, which is `now + 1 day`
- **Produces, overlay:**
  - `TLifecycleOverride`'s paused member becomes `{ status: "paused"; pausedUntil: string | null; presetId: TPausePresetId | null }`
  - `TOverlayAction` gains:
    - `{ type: "pause"; presetId: TPausePresetId; now: Date }`
    - `{ type: "resume"; now: Date }`
    - `{ type: "skipLocally"; nextChargeAt: string; intervalDays: number }`
- **Produces, skip flow:** `useSkipFlow` args gain `skipLocally: () => void`.

- [ ] **Step 1: Write the failing tests:**
  - `pauseUntil("1m", 2026-11-05T12:00Z)` → `"2026-12-05T12:00:00.000Z"`; `"open"` → `null`
  - `resumeChargeAt` → now + 1 day
  - `pause sets a paused lifecycle and clears skippedSkus`
  - `resume sets an active lifecycle at resumeChargeAt`
  - **Review Focus 3:** `skipLocally moves the lifecycle date by intervalDays and clears skips`
  - **Review Focus 3 (`useSkipFlow`):** `when view.skipIsLocal, confirm calls skipLocally, never the API, and notifies success`
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement.** In `useSkipFlow.confirm`, branch first on `view.skipIsLocal`. It's synchronous: no pending phase.
- [ ] **Step 4:** run → PASS.
- [ ] **Step 5: Commit:** `feat(part-a): pause presets, resume and local skip routing`.

### Task 10: Pause sheet and paused actions

**Files:**

- Create: `src/part-a/components/PauseSheet/{PauseSheet.tsx,PauseSheet.type.ts}` (composes `RadioGroup` and `ResponsiveDialog`, so no style file)
- Create: `src/part-a/hooks/usePauseFlow.ts`, `usePauseFlow.type.ts`
- Create: `src/part-a/hooks/usePauseFlow.test.ts`
- Modify: `useSubscriptionCard.ts`, `SubscriptionCard.tsx`, `SubscriptionCard.type.ts`, `src/content/subscription.ts`

**Interfaces:**

- **Consumes:** Task 9.
- **Produces:**
  - **`usePauseFlow({ view, overlay, dispatch, notify })`** returns `{ sheet: IPauseSheetProps; openPause: () => void; openChange: () => void; resume: () => void }`.
  - **The initial selection when changing a pause:**
    - the current `presetId`
    - for the server-paused fixture, which has no preset, `""`: nothing is selected and confirm is disabled until a choice is made
  - **`IPauseSheetProps`:**
    - `open: boolean`
    - `title: string`
    - `intro: string`
    - `value: TPausePresetId | ""`
    - `options: IRadioOption<TPausePresetId>[]`, each `description` the next-box date or the open-ended line
    - `onChange: (value: TPausePresetId) => void`
    - `confirmLabel: string`
    - `confirmDisabled: boolean`
    - `onConfirm: () => void`
    - `keepLabel: string`
    - `onClose: () => void`

- [ ] **Step 1: Copy.** Add:

```ts
manage: { …, pause: "Pause subscription", resume: "Resume now", changePause: "Change pause" },
pause: {
  title: "Pause your subscription",
  changeTitle: "Change your pause",
  intro: "Nothing is sent or charged while paused. You can resume any time.",
  changeIntro: (date: string) => `Currently paused until ${date}.`,
  changeIntroOpen: "Currently paused until you resume.",
  legend: "How long?",
  options: { "1m": "1 month", "2m": "2 months", "3m": "3 months", open: "Until I resume" },
  nextBox: (date: string) => `Next box ${date}`,
  openDescription: "No boxes or charges until you come back",
  confirm: (choice: string) => `Pause for ${choice}`,
  confirmOpen: "Pause until I resume",
  keepActive: "Keep it active",
  keepDate: (date: string) => `Keep ${date}`,
  keepOpen: "Keep it paused",
  pausedTitle: "Subscription paused",
  pausedBody: (date: string) => `Paused until ${date}.`,
  pausedBodyOpen: "Paused until you resume.",
  resumedTitle: "Subscription resumed",
  resumedBody: (amount: string, date: string) => `Your next charge is ${amount} on ${date}.`,
},
```

`confirm` takes the lower-case choice: `"1 month"` → "Pause for 1 month".

- [ ] **Step 2: Write the failing tests** in `usePauseFlow.test.ts` (spies for `dispatch` and `notify`):
  - `openPause starts on 1 month and confirms "Pause for 1 month"`: after `onConfirm`, `dispatch` gets `{ type: "pause", presetId: "1m" }` and the notice title is "Subscription paused".
  - `choosing Until I resume relabels the confirm`: `confirmLabel === "Pause until I resume"`.
  - `openChange on the server-paused fixture selects nothing and disables confirm`: `value === ""` and `confirmDisabled true`.
  - `openChange after a local pause starts from its preset`.
  - `resume dispatches resume and notifies with the next charge`.
- [ ] **Step 3:** run → FAIL.
- [ ] **Step 4: Implement.** Action order:
  - active, not editing: `[edit, skip, pause]`
  - paused: `[resume (primary), changePause (secondary)]`

  The sheet's footer has the confirm (primary) and keep (secondary) buttons.

- [ ] **Step 5:** rerun the tests → PASS.
- [ ] **Step 6: Commit:** `feat(part-a): pause with a chosen duration, change pause and resume`.

**PR 5 gate:** `verify`. The controller checks the pause sheet and both paused headings at 375 and 1200, and walks paused fixture → Resume now → skip (Review Focus 3). Title: `feat(part-a): pause`.

---

## PR 6 · `feat/part-a-cancel` (base `feat/part-a-pause`)

### Task 11: Cancel flow

**Files:**

- Create: `src/part-a/components/CancelConfirm/{CancelConfirm.tsx,CancelConfirm.style.ts,CancelConfirm.type.ts}`
- Create: `src/part-a/components/CancelSurvey/{CancelSurvey.tsx,CancelSurvey.style.ts,CancelSurvey.type.ts}`
- Create: `src/part-a/hooks/useCancelFlow.ts`, `useCancelFlow.type.ts`
- Create: `src/part-a/hooks/useCancelFlow.test.ts`
- Modify: `overlay.ts`, `overlay.type.ts`, `overlay.test.ts`, `useSubscriptionCard.ts`, `SubscriptionCard.tsx`, `SubscriptionCard.type.ts`, `src/content/subscription.ts`
- Modify: `AGENTS.md` (repo map: add `src/part-a/logic`, `src/part-a/hooks` and `src/part-a/components` under the Part A line)

**Interfaces:**

- **Consumes:** `overlayReducer`, the edit mode's `start()` (Task 8), `IBoxPricing` (Task 1).
- **Produces:**
  - **`TOverlayAction` gains** `{ type: "cancel"; now: Date }`, which sets `{ status: "cancelled", cancelledAt: now.toISOString() }`.
  - **`TPageView = "subscription" | "cancelConfirm" | "survey"`**, held in `useCancelFlow`.
  - **`useCancelFlow({ subscription, dispatch, notify, startEdit })`**, where `subscription: ISubscriptionView` and `startEdit: () => void` is the edit mode's `start`, returns:
    - `view: TPageView`
    - `open()`, `back()`, `editNextBox()`, `confirmCancel()`
    - `survey: ICancelSurveyProps`
    - `confirm: ICancelConfirmProps`
    - `h1Ref`
  - **`ICancelConfirmProps`:**
    - `reasons: { title: string; body: string }[]`
    - `editLink: { label: string; onClick: () => void } | null`, where `null` unless active
    - `keepLabel: string`, `onKeep: () => void`
    - `cancelLabel: string`, `onCancel: () => void`
    - `backLabel: string`, `onBack: () => void`
  - **`ICancelSurveyProps`:**
    - `value: TCancelReason | ""`
    - `options: IRadioOption<TCancelReason>[]`
    - `onChange: (value: TCancelReason) => void`
    - `sendDisabled: boolean`
    - `onSend: () => void`
    - `onSkip: () => void`
  - **`TCancelReason = "tooMuch" | "cost" | "otherProduct" | "noResults" | "other"`**

- [ ] **Step 1: Copy.** Add:

```ts
manage: { …, cancel: "Cancel subscription" },
cancel: {
  title: "Before you cancel",
  lead: "A couple of things worth knowing.",
  back: "Back",
  tooMuchTitle: "Too much product left? You don't need to cancel",
  tooMuchBody: "You can skip your next box, or leave out a single product, from your subscription page whenever you like.",
  editLink: "Edit my next box",
  costTitle: "Subscribing costs you less",
  costBody: (percent: number, perBox: string, perYear: string) =>
    `You pay ${percent}% less on every box: ${perBox} off your next one, ${perYear} over the next 12 boxes.`,
  keep: "Keep my subscription",
  confirm: "Cancel subscription",
},
survey: {
  title: "Your subscription is cancelled",
  lead: "You won't be charged again.",
  legend: "Optional · Why did you cancel?",
  reasons: {
    tooMuch: "I have too much product left",
    cost: "It costs too much",
    otherProduct: "I'm trying a different product",
    noResults: "I didn't see results",
    other: "Something else",
  },
  send: "Send answer",
  skip: "No thanks",
  doneTitle: "Your subscription is cancelled",
  doneBodySent: "Thanks for telling us why.",
  doneBody: "You won't be charged again.",
},
```

- [ ] **Step 2: Write the failing tests:**
  - **Unit:** `cancel sets a cancelled lifecycle at now`.
  - **`useCancelFlow.test.ts`, `cancel takes two calls`:** `open()` → `view "cancelConfirm"`; `confirmCancel()` → `dispatch` gets `{ type: "cancel" }` and `view "survey"`. Stub `window.scrollTo` with `vi.fn()`, because jsdom doesn't implement it.
  - **`keep and back return unchanged`:** `view "subscription"`, and no `dispatch`.
  - **`edit my next box returns in edit mode`:** `view "subscription"`, and the injected `startEdit` spy was called.
  - **`the edit link exists only while active`:** `confirm.editLink` is `null` when `subscription.status` is `"paused"`.
  - **`survey is optional`:** `sendDisabled` is true until `onChange("cost")`. `onSkip` → `view "subscription"` with the notice body "You won't be charged again."; `onSend` → "Thanks for telling us why."
- [ ] **Step 3:** run → FAIL.
- [ ] **Step 4: Implement.**
  - **Before you cancel:** a single centered column at every width, like the survey. The "← Back" quiet button sits above the h1.
  - **The reasons** are a `<ul>` with `Icon name="check-circle"` in `text-on-status-active`, a `text-section` title and a `text-muted` body. Separators are `border-line`, as in the mockup. There are no cards.
  - **The edit link** is `Button variant="quiet"` under the first reason.
  - **Buttons:** "Keep my subscription" (`primary`, `fullWidth`, `lg`), then "Cancel subscription" (`destructive`, `fullWidth`, `lg`), 32px under the list.
  - **Savings figures** come from the current view's `pricing.savingCents` (`perBox`) and `pricing.savingCents * 12` (`perYear`), computed in the hook.
  - **The quiet "Cancel subscription"** joins the action area:
    - active: `[edit, skip, pause, cancel]`
    - paused: `[resume, changePause, cancel]`
  - **Survey:** `RadioGroup appearance="list"`, then "Send answer" (`primary`) and "No thanks" (`quiet`). Both return to `"subscription"` with a success notice (`doneTitle`, plus `doneBodySent` or `doneBody`).
  - **Focus:** on every `TPageView` change, focus `h1Ref` (`tabIndex={-1}`) and `window.scrollTo({ top: 0 })`, in `useCancelFlow`.
- [ ] **Step 5:** run the tests → PASS.
- [ ] **Step 6: Update the `AGENTS.md` repo map.**
- [ ] **Step 7: Commit:** `feat(part-a): cancellation flow with reasons to stay and an optional survey`.

**PR 6 gate:** `verify`. The controller walks the whole journey at 375 and 1200 on all four fixtures. Title: `feat(part-a): cancellation flow`.

---

## Final review (controller)

After PR 6 has passed its gate, one Opus `reviewer` reviews the whole stack (`main..feat/part-a-cancel`) against the spec and this plan's Review Focus. Fixes go in as new commits on the PR that owns the code, followed by a rebase cascade.
