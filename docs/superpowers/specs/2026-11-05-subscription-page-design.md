# Part A, "Manage my subscription": design

Date: 2026-11-05 · Builds on: `docs/superpowers/specs/2026-11-05-shared-ui-components-design.md` (merged in #4–#9) · Brief: `INSTRUCTIONS.md`, Part A

## Intent

A customer opens this page, usually on a 375px phone, to check what's coming or to change something. The page must let them understand their subscription **without performing any action**, with minimum cognitive effort, and then let them change it in ways that keep them subscribed. Every customer who cancels is lost revenue, and the most common reason for cancelling is "I have too much product left" (38%). So the extras on this page are all about adjusting the supply instead of leaving: changing quantities, skipping one product, skipping the whole box, pausing. A customer who still wants to cancel finishes in two taps from the page.

Reviewers judge product and design decisions more than layout. The page should read as deliberate: calm by default, with every change made on purpose and confirmed where a mistake is costly.

## Goals

- **At a glance, no taps:**
  - every product, with its quantity
  - the status, as an icon and a word
  - for an active subscription, when the next charge happens and how much it is
- **Savings visible everywhere a price appears:** the original price crossed out and small, and the price the customer actually pays bold.
- **Every change the customer makes is deliberate:**
  - editing products is a separate mode with Save and Cancel
  - skipping the whole box and pausing go through a confirmation sheet
- **The customer always knows what happened and what to do next:** loading, success and failure states for loading the page and for the skip, including the API's "changed elsewhere" rejection.
- **Paused and cancelled look nothing like active, and never offer a skip.**
- **Phone first:** designed at 375px, and responsive: a two-column layout on large screens.

## Non-goals

- Delivery frequency is simulated in the local overlay; the product-list page is not implemented, so its button has no navigation or state effect. The API remains unchanged.
- Removing a product from the subscription. The quantity minimum is 1, and per-product skip covers "not this time".
- Persisting anything that isn't in the API. Local changes reset on reload; the brief allows this.
- Undoing a whole-box skip. The API can't reverse it, and the confirmation step exists so that it isn't needed.
- Reactivating a cancelled subscription.
- Routing. Views inside Part A are component state, not URLs.

## Anti-goals

- **Trapping the customer.** Cancel must stay reachable, visible and two taps from the page: "Cancel subscription" → "Before you cancel" → "Cancel subscription". Choosing a reason is optional, with no guilt copy or extra step before the cancel button.
- **Generic reasons to stay.** The cancellation page offers at most one alternative matched to an optional reason.
- **Cards inside cards, or a busy default view.** Controls appear only in edit mode or in sheets.
- **A crossed-out number that means anything other than "price before the subscription discount".**
- **Error copy that blames or explains internals.** Errors are generic and say what to do next: "We couldn't load your subscription. Please try again, or contact support."
- **A retry that can never succeed.** Retrying a skip after a 409 with the stale `updatedAt` always fails again.

## Constraints

- **Brief:**
  - The page lives in `src/part-a/SubscriptionCard.tsx`.
  - Data comes from `getSubscription()` and `skipNextShipment()` in `src/api/mockApi.ts`. Everything else is simulated in local state.
  - Fixtures are selected with `?fixture=active|paused|cancelled|error` and `&conflict=always`.
  - Never edit `src/api` or `INSTRUCTIONS.md`.
- **Repo rules (`AGENTS.md`):**
  - presentation-only `.tsx`; behavior in `useX.ts`; pure logic in `src/part-a/logic` with unit tests
  - classes in `X.style.ts` via `cx()`; types in `X.type.ts` with `I`/`T` prefixes
  - all copy in `src/content` (`src/content/subscription.ts` exists)
  - tokens only (the text sizes, the three radii, light only)
  - control-border rule; status always shown as icon plus word
  - jsx-a11y; axe on every view in `e2e/views.ts`
- **Build from the shared components already on `main`:** `Button` (with `pending`), `StatusBadge`, `Badge`, `Alert`, `ProductThumbnail`, `PriceDisplay`, `QuantityStepper`, `RadioGroup`, `ResponsiveDialog`, `FormField`, `Icon`, and `formatMoney` and `clampQuantity` in `src/shared/logic`. Part-only pieces go in `src/part-a/components`.
- **The money rule is the API's:** `totalAfterDiscount(items, discountPercent)` from `src/api/fixtures.ts` (subtotal first, then the discount, then rounding). Reuse it; don't re-derive it.

## Decisions (Hugo's)

1. **One subscription per customer,** as the API returns it.
2. **Layout: one "receipt" card** (option B of three):
   - **Header:** an eyebrow ("Next box") and the status badge.
   - **One row per product:** thumbnail, name, "Qty N", the subscriber price in bold with the original price crossed out under it.
   - **Total row:** "Charged Wed, Nov 11", "Every 30 days", the pre-discount total crossed out, the charged total in bold, and a "You save $17.98" chip.
3. **Spacing on a 4px grid with the real tokens.** The approved mockup used:
   - 16px page and card insets
   - 24px under the page title
   - 16px row padding
   - 12px gap between the thumbnail and the text
   - 56px thumbnails
   - 12px between stacked buttons
   - 16px between the card and the actions
   - tap targets of 44–48px
4. **Editing is "read first, edit on purpose":**
   - **Entering:** the receipt is read-only. An "Edit products" button switches the card into edit mode.
   - **In edit mode,** each row gets a `QuantityStepper` and a quiet "Skip once" link. A skipped row dims, shows "Skipped in the next box only", has an "Undo" link, and is excluded from the total.
   - **The total updates live.** The header becomes "Editing next box". The total row reads "New total" with "Currently $X" in plain text (never crossed out).
   - **Leaving:** nothing applies until "Save changes". "Cancel" discards the edits.
5. **Change quantity** of each product. **Skip one product** from the next box only, keeping the rest.
6. **Cancellation flow:**
   - **"Before you cancel" page,** reached from "Cancel subscription". It's a full in-page view, not a sheet, with a "← Back to subscription" link.
   - **Optional reason first:** five large radio rows in brief order: too much product, too expensive, trying a different product, didn't see results, something else. The "Cancel subscription" button stays visible and works without any selection.
   - **One matched inline alternative:** too much product offers the existing Skip sheet with the moved charge date; cost offers local 60-day cadence with annual difference computed from the current price and interval; trying another product shows a "Browse products" button for the unavailable product-list page, with no navigation or state effect; no results offers support and, while active, the existing Pause sheet without health claims; something else has no offer. Accepted changes return to the receipt with a success notice. The 60-day offer disappears once cadence reaches 60 days.
   - **After cancelling:** the cancelled receipt appears immediately, with a success notice saying "You won't be charged again." The selected reason is stored locally; there is no post-cancel survey.
7. **Skipping the whole box:**
   - **Confirm** in a bottom sheet (`ResponsiveDialog`) that shows the old date crossed out → the new date, and the amount charged on the new date.
   - **Waiting:** the confirm button shows a spinner and "Skipping…" (`Button pending`). The sheet stays open and can't be dismissed while the request is pending.
   - **Success:** the sheet closes, the receipt updates, and a success `Alert` above the card says the new date and amount.
   - **Error:** a generic `Alert` with "Try again" and "Contact support".
8. **Generic error copy** everywhere (decision made on the load error).
9. **Pause, with a chosen duration:**
   - **Pausing from active:** a "Pause subscription" button opens a bottom sheet with a radio list of 1 month, 2 months, 3 months (each showing its resulting next-charge date) and "Until I resume". The confirm button names the choice ("Pause for 1 month").
   - **The paused page:**
     - an amber "Paused" badge
     - a header reading "Paused until Sun, Nov 29" or "Paused until you resume"
     - "No charges while paused" directly below the heading, before the items; timed pauses also show the next-charge amount and date there
     - a "Box when you resume" label above the listed products, whose names and prices use muted text tokens and regular weight, without compare-at prices or a savings line
     - no skip and no edit
     - actions: "Resume now" (primary), "Change pause" (the same sheet, starting from the current choice), and a quiet "Cancel subscription"
10. **Keep all four extras:** quantity, skip one product, pause, cancellation flow. Hugo accepted the breadth-versus-depth risk.
11. **Desktop is responsive** (option B of three):
    - **From the `lg` breakpoint (1024px):** two columns. The whole receipt card sits on the left, unchanged except that product rows spread into columns (name · quantity · price). A "Manage" panel on the right, about 320px wide and sticky at the top, holds the actions.
    - **Reading and changing are visibly separate.** The receipt never splits.

## My calls (made during the conversation, shown in mockups, not explicitly ruled on)

- **Active page actions, top to bottom:** "Edit products", "Skip the whole box", "Pause subscription" (all secondary, full width), then "Cancel subscription" as a quiet button.
- **409 "changed elsewhere":** don't retry blindly. Reload the subscription (`getSubscription()`) and compare the box being confirmed against the refreshed box (next charge date, charge date after skipping, total, product additions/removals and quantities, and status). Keep the sheet open with the fresh facts and an info `Alert` naming each visible change, with changed values marked in the summary. If only the version changed, say "Nothing about this box changed. Skip it?" rather than asking the customer to find a difference. Repeated 409s repeat the honest explanation. If the reload shows the subscription is paused or cancelled, close the sheet, remove skip as an option and show an info notice explaining the new status.
- **Other skip failures** (network, 500): an error `Alert` inside the sheet saying "We couldn't skip your box. Nothing changed: you'll still be charged on {date}". The primary button becomes "Try again", alongside "Contact support". A 400 indicating the box can no longer be skipped reloads its status like a 409.
- **Page load:** a static skeleton of the receipt card, with no shimmer (reduced motion) and an accessible "Loading your subscription…" text. Load failure (`?fixture=error`): an error `Alert`, "We couldn't load your subscription. Please try again, or contact support.", with "Try again" (calls `getSubscription()` again) and "Contact support".
- **"Contact support"** is a `mailto:` link to a reserved, fictional address, `support@naturawellness.example`, since the brand isn't real.
- **"Skip the whole box" from anywhere** (the page, or reached after the cancel page) always goes through the same confirmation sheet.
- **Local actions** (save edits, pause, change pause, resume, cancel) apply instantly with no simulated latency and no simulated failure, and each confirms with a success `Alert` above the card. Only the real API call (the skip) has a pending state.
- **Pause durations** are 30, 60 or 90 days, matching the 30-day cycle, counted from the current effective next charge (including a skipped charge). Changing an existing pause counts from its stored original next charge, not its paused-until date. If that original charge has passed, count from today. The next charge is on the pause end date. "Resume now" schedules tomorrow or the original next charge if later, so a skipped date survives a pause and resuming never charges on the spot.
- **Paused fixture total:** the API sends no total for a paused subscription. The page computes it with `totalAfterDiscount` and shows "Your next box: Sun, Nov 29 · $101.87".
- **The action area follows the mode.** The action area is the buttons under the card on a phone, and the "Manage" panel on desktop. It always shows the current mode's actions:
  - active: the four actions
  - editing: Save changes and Cancel
  - paused: Resume now, Change pause, Cancel subscription
  - cancelled: no action area at all; the receipt keeps the left column's width
- **The "Manage" panel** is just a heading and the buttons. I dropped the mockup's "Changes apply from your next box" line, because it isn't true for pause or cancel.
- **Between 375px and 1024px:** the phone layout, as a single column of at most 560px, centered. The "Before you cancel" reason list and matched alternative stay in that single centered column at every width. Success and error alerts sit above the receipt, in the left column on desktop.
- **Dates** are formatted in the user's locale and timezone as weekday, month and day ("Wed, Nov 11"), adding the year only when it isn't the current year.

## How local changes coexist with the API (my call; the builder may refine the mechanics, not the outcomes)

The server snapshot (from `getSubscription` or `skipNextShipment`) stays the source of truth for what the API owns. The page keeps a **local overlay** on top of it and derives the view from snapshot + overlay:

- **`quantities` (by SKU):** applies to every future box. It survives reloads of the snapshot within the session (after a 409, or after a successful skip).
- **`skippedSkus`:** applies to the next box only. It is cleared when the whole box is skipped, because the box it referred to no longer exists.
- `intervalDays` and `cancelReason` stay local. The product-list page is not implemented, so its button does not navigate or change the subscription.
- **Lifecycle override:**
  - local pause (until a date, or open-ended), resume, or cancel
  - status, next charge date and pause end are taken from the override when one is present

**Totals:** the charged total for the next box is `totalAfterDiscount(itemsInNextBox, discountPercent)`, where `itemsInNextBox` applies `quantities` and drops `skippedSkus`. Without local edits, this equals the API's `nextChargeTotalCents`. The pre-discount total is the plain subtotal of the same items, and the saving is the difference between the two.

**Line prices:** each line's subscriber price is the line subtotal less the discount, rounded so that **the lines always sum exactly to the charged total.** Spread the rounding remainder across the lines (largest remainder method). Otherwise the fixture shows $25.46 + $76.42 = $101.88 against a total of $101.87.

**Skip routing:**

- When there's no lifecycle or cadence override and the snapshot is active, skip calls `skipNextShipment` with the snapshot's `updatedAt`.
- When the lifecycle or cadence was changed locally (for example the paused fixture resumed locally), the server would reject the skip with a 400, or move a date the customer no longer sees. So the skip is applied locally instead:
  - the next charge moves by `intervalDays`
  - the same confirm, success and "Next box skipped" states
  - no pending delay and no conflict
- This is the one place where local and real behavior meet, and it's invisible to the customer.

**Per-product skip limits:** at least one product must stay in the next box. When only one unskipped product is left, its "Skip once" is replaced by the hint "To skip everything, use Skip the whole box".

## States and views

| View              | Reached by                                                | Shows                                                                                                                                                                         | Actions                                                                            |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Loading           | first load, "Try again"                                   | static receipt skeleton                                                                                                                                                       | —                                                                                  |
| Load error        | `?fixture=error`, any load failure                        | error `Alert`                                                                                                                                                                 | Try again, Contact support                                                         |
| Active            | `?fixture=active`, after resume                           | receipt card with date, totals and savings                                                                                                                                    | Edit products, Skip the whole box, Pause subscription, Cancel subscription (quiet) |
| Editing           | Edit products, or "Edit my next box" from the cancel page | receipt with steppers, Skip once / Undo, live new total                                                                                                                       | Save changes, Cancel                                                               |
| Skip sheet        | Skip the whole box                                        | confirm → pending → (closes on success) / 409 named changes or honest no-change info / error; paused or cancelled refresh closes the sheet and announces status               | Skip this box / Try again, Keep my box, Contact support (on error)                 |
| Pause sheet       | Pause subscription, Change pause                          | radio list: 1, 2, 3 months, Until I resume                                                                                                                                    | Pause for …, Keep it active / Keep {date}                                          |
| Paused            | `?fixture=paused`, after pausing                          | amber badge, "Paused until …", "No charges while paused" first (plus next-charge line when timed), muted "Box when you resume" products with prices but no compare-at/savings | Resume now, Change pause, Cancel subscription (quiet)                              |
| Before you cancel | Cancel subscription (active or paused)                    | optional reason list with one matched offer; the different-product offer is a Browse products button with no effect because the product-list page is unavailable              | Back to subscription, offer action when present, Cancel subscription               |
| Cancelled         | `?fixture=cancelled`, after direct cancellation           | grey badge, "Cancelled on {date}", "No more charges" first, muted "Last box" products with prices but no compare-at/savings                                                   | none                                                                               |

Success `Alert`s (above the card, `role="status"`, replaced by the next one): box skipped (with the new date and amount), changes saved, paused (until when), resumed (next charge date), cadence changed, cancellation confirmed.

## Accessibility notes

- Shared native dialogs handle dismissal; after a cancellation alternative opens a sheet, closing that sheet returns focus to the subscription heading.
- **Editing:**
  - Entering edit mode moves focus to the card's heading.
  - Save and Cancel return focus to "Edit products".
  - "Skip once" and "Undo" are buttons whose accessible names include the product name ("Skip Vitamin D once").
- **Status changes:**
  - Success, info and error alerts are announced: `role="status"` for success and info, `role="alert"` for errors.
  - The skeleton has an accessible loading label.
- **Dimming:** inactive product names and prices use the contrast-tested muted text token, not opacity; their status line explicitly says no charges are due. Only the thumbnails of skipped active rows use opacity, alongside the "Skipped in the next box only" note.

## Testing

- **Unit tests** (`src/part-a/logic`): the overlay → view derivation, line-price allocation that always sums to the total, pause date math, skip routing (real versus local), and per-product skip limits.
- **Hook and diff tests** for the skip flow against a mocked API: success, 409 → reload → changed facts or no visible change → re-confirm (including repeated 409), paused/cancelled refresh notices, error → retry, and a pending double tap that sends only one request. Pure diff tests cover dates in local time, total, products, quantities and status.
- **e2e:**
  - The existing `e2e/views.ts` already lists the four fixtures; add `&conflict=always`.
  - Smoke checks: the at-a-glance content, and that paused and cancelled show no skip.
  - Run locally; CI's e2e job is paused for now.

## Left to the builder

- File and component breakdown inside `src/part-a`, and the exact shape of the overlay and reducer.
- The exact copy wording beyond what's quoted here (all of it lives in `src/content/subscription.ts`).
- The quantity maximum for the stepper (suggested: 10).
- Whether the views get Storybook stories (shared components already have theirs).
- PR slicing (≤ ~20 files per PR, per `AGENTS.md`).
