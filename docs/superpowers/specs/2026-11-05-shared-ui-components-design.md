# Shared UI components: design

Date: 2026-11-05 · Builds on: `docs/superpowers/specs/2026-11-05-brand-foundations-design.md` (merged in #2, #3)

## Intent

Build every shared UI component the Part A page needs, and document each one in Storybook, before writing the page itself. The page then becomes a matter of composing tested parts. The components must also serve Part B's buy box: Part B will restyle them through its own theme (`data-theme`), not fork them.

## Goals

- Twelve components in `src/shared/components`: the ten from the conversation plus `Icon` and `StatusBadge`. Each one has:
  - a Storybook docs page
  - stories for every variant and state
  - interaction tests where it has behavior
- One `Icon` set that replaces `StatusIcon`, covering what these components and the buy box need.
- Theme-ready: colors, fonts **and shape** (radii) come from semantic tokens, so a Part B theme can match the reference without touching component code.
- Mobile first (375px), keyboard and screen-reader complete, every story passing the axe gate in CI.

## Non-goals

- The Part A page itself, data fetching, and the API state machine (next project).
- Part B's theme values and buy-box layout. Part-B-only pieces are excluded too: the star rating, the perks checklist, the trust row.
- `Card` and layout primitives: deferred until the page shows a second use.
- Toasts. Feedback is inline, next to the action that caused it.
- `CheckboxCard` (multi-select). We build it only if a flow needs multi-select.
- Real form validation rules beyond showing an error message.

## Anti-goals

- Re-implementing what the platform does. Use native `<button>`, `<input type="radio">`, `<select>` and `<dialog>`. No custom listbox, no hand-rolled focus trap, no roving-tabindex code.
- Components that only look right in the brand theme (hard-coded radii, a sizing that Part B can't reach).
- Silent failure states: a pending button that can be clicked twice, a stepper that removes an item at 0, a dialog that loses focus on close.

## Decisions (Hugo's)

1. **Component list:** Select, RadioGroup, QuantityStepper, SelectableCard, PriceDisplay, ResponsiveDialog, FormField. We discussed adding Button, StatusBadge, Alert and ProductThumbnail, and merging SelectableCard into RadioGroup's card look (proposed in the conversation; this document makes them binding).
2. **Part B:** the components target Part B as well as Part A.
3. **Control borders:** a control may use the faint decorative `line` border when visible text and an icon identify it without the border. That covers `Select` (value plus chevron), `QuantityStepper` (− and + buttons plus value) and unselected `RadioGroup` cards (radio circle plus label). Controls the border alone identifies always use `control-line` (≥ 3:1): the radio circle, checkboxes, and empty text inputs and textareas. A selected card uses an `accent` border. Focus always shows the `focus` ring, whatever the border.

## Component specs

Paths: `src/shared/components/<Name>/` holds `<Name>.tsx`, `.style.ts`, `.type.ts`, `use<Name>.ts` when it has behavior, `<Name>.stories.tsx` and `<Name>.mdx`. Copy goes in `src/content/components/<name>.ts`, one file per component.

| Component          | API essentials                                                                                                                                                                                                                                                                                        | Behavior and accessibility                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Icon`             | `name: TIconName`, `className`. Names: `check`, `check-circle`, `pause`, `x-circle`, `alert-triangle`, `info`, `chevron-down`, `minus`, `plus`, `close`. 24-unit stroke paths in `Icon.data.ts`.                                                                                                      | `aria-hidden`, `focusable="false"`, `currentColor`. Never the only signal. `StatusIcon` is deleted and its callers migrated.                                                                                                                                                                                                                                                                                                                                                                                           |
| `Button`           | `variant: primary \| secondary \| quiet \| destructive`; `size: md \| lg \| icon` (`icon` is square and needs an `aria-label`); `fullWidth`; `pending`; `type`; native button props; `children` is free (Part B puts "Add to cart · $25.46" in it).                                                   | While pending: `aria-disabled="true"`, clicks ignored (no double submit, Enter and Space included), a spinner, the label kept for the accessible name, and `aria-busy`. `destructive` is a quiet red outline using `on-status-danger`, not a solid red fill.                                                                                                                                                                                                                                                           |
| `Badge`            | `tone: highlight \| active \| paused \| cancelled \| danger`; `icon?: TIconName`; `children`.                                                                                                                                                                                                         | Plain text, no role. Status tones are sentence case at `text-small` semibold. `highlight` is the promotional label (Part B's "Best value", Part A's "Recommended" offer): `text-eyebrow` style, uppercase via CSS (copy stays sentence case), on the new `highlight`/`on-highlight` tokens.                                                                                                                                                                                                                            |
| `StatusBadge`      | `status: active \| paused \| cancelled`.                                                                                                                                                                                                                                                              | A `Badge` with the status's icon and word (from content).                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `Alert`            | `tone: success \| info \| danger`; `title`; `children`; `action?: ReactNode` (usually a quiet `Button`).                                                                                                                                                                                              | `role="status"` for success and info, `role="alert"` for danger. It renders where it's placed; the caller decides. Example text in its stories: "Your subscription changed elsewhere. We reloaded it; check and try again."                                                                                                                                                                                                                                                                                            |
| `ProductThumbnail` | `src: string \| null`; `name` (alt text and initial); `size: sm \| md \| lg`; `decorative?` (product name already next to it).                                                                                                                                                                        | When `src` is null or the image fails to load, a `fill-soft` tile with the product's initial. The tile is `role="img"` labelled with `name`, or `aria-hidden` when `decorative`; `decorative` images get `alt=""`.                                                                                                                                                                                                                                                                                                     |
| `PriceDisplay`     | `amountCents`; `compareAtCents?`; `size: sm \| md \| lg`; `layout: inline \| stacked` (Part B shows the original price under the price).                                                                                                                                                              | Formatting lives in `src/shared/logic/money.ts`: `formatMoney(cents) → "$25.46"` (en-US, USD), unit-tested. The original price is crossed out (`line-through`) and gets screen-reader text from content ("Was $29.95"). Digits are `tabular-nums`.                                                                                                                                                                                                                                                                     |
| `QuantityStepper`  | `value`, `onChange`, `min=1`, `max=10`, `label`.                                                                                                                                                                                                                                                      | Decrease/increase are `<button>`s with labels from content, disabled at the bounds (never removes the item at `min`). The value is in an `aria-live="polite"` output. The hook clamps (pure `clampQuantity` with a unit test).                                                                                                                                                                                                                                                                                         |
| `RadioGroup`       | `legend`; `name`; `value`; `onChange`; `appearance: list \| card`; options `{ value, label, description?, trailing?, badge?, panel? }`.                                                                                                                                                               | A native `<fieldset>`/`<legend>` with `<input type="radio">`, so the browser handles arrow keys and grouping. In `card` appearance the whole card is the label. `panel` holds the nested content of the selected option (Part B's frequency select and perks). It renders inside the card frame but **outside the `<label>`**, and only while that option is selected, so there are no interactive elements inside a label. Selected card: `fill-selected` background (or a theme-chosen fill) and an `accent` border. |
| `Select`           | `label`; `value`; `onChange`; `options: { value, label }[]`; `layout` comes from `FormField`.                                                                                                                                                                                                         | Native `<select>`, with a `chevron-down` `Icon` drawn over it (`appearance-none`).                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `FormField`        | `useFormField({ hint?, error? })` returns `{ controlId, hintId, errorId, describedBy, invalid }`; `<FormField field label hint? error? layout: stacked \| inline>` wraps the control (Part B: "Delivered every [30 days]"). The control spreads `id={controlId}`, `aria-describedby`, `aria-invalid`. | Wires `<label for>`, `aria-describedby` (hint and error) and `aria-invalid`. The error text has `role="alert"`. Used by `Select` and by the textarea for the "other" cancellation reason.                                                                                                                                                                                                                                                                                                                              |
| `ResponsiveDialog` | `open`; `onClose`; `title`; `description?`; `children`; `footer?`.                                                                                                                                                                                                                                    | Native `<dialog>` + `showModal()`: focus trap, Esc, and focus returned to the trigger. Below `sm` (640px) it's a bottom sheet pinned to the bottom with safe-area padding; above that it's a centered modal. The body scrolls inside the panel. A close button labelled from content. Opacity fade only, honoring reduced motion. The behavior hook syncs `open` with `showModal`/`close` and the `close`/`cancel` events.                                                                                             |

## Token additions

- **Shape enters the theme contract:**
  - **New tokens:** `radius-control` (buttons, inputs, steppers), `radius-card` (option cards, dialogs) and `radius-pill` (badges).
  - **Removed:** `radius-sm/md/lg`; the foundations stories are migrated.
  - **Brand values:** `radius-control` 10px, `radius-card` 14px, `radius-pill` 9999px. These match the brainstorm mockups.
  - **Contract:** `themeContract.ts` gains `radiusRoles`. The contract test then requires every theme to declare them, so Part B's theme can match the reference's corners.
- **New color pair `highlight` / `on-highlight`:** the promotional badge. The brand values are `--brand-lime-100` / `--brand-olive-900` (9.6:1), deliberately distinct from the amber "paused". Part B's theme will set its pale-yellow pair. This is the only new color role; reusing `status-paused` would force Part B to repaint "paused" to get its badge.
- **Contrast pairs added:** `on-status-danger` on `surface` and on `bg` (destructive button, inline error text), `accent` on `fill-selected` (selected card border and text), and `on-highlight` on `highlight`.

## Documentation

- **Sidebar:** each component's MDX follows the Color/Typography pages: intro, all variants, Use when / Don't use when, Accessibility, Do / Don't.
- **Grouping:** under `Components/<Name>`. A `Components/Overview` page lists all of them and the rules they share (native elements, presentation-only, theme-ready).
- **Part B readiness:** every component story renders under the toolbar theme picker. When Part B's theme exists, every page shows the buy-box look with no story changes.

## Testing

- **Unit (Vitest, jsdom):** pure logic (`formatMoney`, `clampQuantity`) and the behavior hooks (`useQuantityStepper`, `useResponsiveDialog`, the `useButton` pending guard).
- **Interaction (Storybook play functions, run by `test:storybook` in real Chromium):**
  - keyboard selection in `RadioGroup` (arrows move the selection)
  - the `card` panel appears only for the selected option
  - stepper bounds, and the live value updating
  - a pending `Button` ignoring a second click
  - dialog: Esc closes it, focus returns to the trigger, and the bottom sheet at 375px vs centered at 1280px
  - `ProductThumbnail` fallback on a null or broken src
- **Accessibility:** the existing gate (`a11y.test: "error"`) covers every story.
- **e2e:** unchanged until the page exists.

## Calls made (mine; check these)

- **Native elements throughout:** native controls instead of custom ARIA widgets.
- **Merged radio controls:** `SelectableCard` folded into `RadioGroup appearance="card"`.
- **Shape tokens:** radius tokens renamed by role and added to the theme contract.
- **Copy files:** one content file per component under `src/content/components/`, so parallel PRs don't conflict.
- **Folder:** components live in `src/shared/components`; `Icon` replaces `StatusIcon` everywhere.
- **Destructive style:** a red text-and-outline button, not a solid red fill. The page's "Cancel subscription" shouldn't shout.
- **Stepper bounds:** 1–10.
- **Dialog breakpoint:** the bottom sheet / modal switch is at `sm` (640px).
- **Badge colors:** one new color pair, `highlight` / `on-highlight`, for promotional badges. These badges render in capitals through CSS, so the copy stays sentence case.
- **Button sizes:** `Button` gains `size="icon"` (square, `aria-label` required) for the dialog close button and the stepper's − and +.
- **`FormField` wiring:** it takes ids from a `useFormField()` hook rather than a render-prop child. The house lint bans calling a function inside JSX.

## Left to the builder

- **Visuals:** icon path data, spinner implementation (CSS animation; static under reduced motion), and the exact padding and gaps within the token scale.
- **Stories and docs:** which stories show which combinations, and MDX wording following the foundations pages' tone.
