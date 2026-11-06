import { radioGroup } from "@/shared/components/RadioGroup/RadioGroup.style";

/** The selected card swaps 1px for a 2px border and gives the pixel back in padding, so nothing moves. */
export const purchaseOption = {
  frame: "flex flex-col rounded-card",
  unchecked: {
    frame: "border border-line bg-surface",
    row: "px-5 py-[17px]",
  },
  checked: {
    frame: "border-2 border-accent bg-fill-selected",
    row: "px-[19px] py-4",
  },
  row: "flex cursor-pointer items-center gap-3 text-body font-semibold text-fg",
  radio: radioGroup.radio,
  text: "flex min-w-0 flex-1 items-center gap-3",
  badge:
    "shrink-0 rounded-pill bg-highlight px-[11px] py-[3.25px] text-micro whitespace-nowrap text-on-highlight uppercase",
  price: "shrink-0",
  /** Grid rows ease between 0fr and 1fr, so the card grows to its content without a measured height. `visibility` switches at the end of a collapse and the start of an expand, so the content stays painted while it moves. */
  collapse:
    "grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
  expanded: "visible grid-rows-[1fr]",
  collapsed: "invisible grid-rows-[0fr]",
  /** Starts 4px into the row's bottom padding so the select's focus ring (2px + 2px offset) is not clipped. */
  clip: "-mt-1 min-h-0 overflow-hidden",
  extras: "pt-1 pr-[19px] pb-[15px] pl-[51px]",
} as const;
