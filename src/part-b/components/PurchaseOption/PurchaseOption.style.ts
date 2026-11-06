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
  extras: "pr-[19px] pb-[15px] pl-[51px]",
} as const;
