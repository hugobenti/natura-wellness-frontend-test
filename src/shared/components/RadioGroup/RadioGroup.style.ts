export const radioGroup = {
  base: "m-0 min-w-0 border-0 p-0",
  legend: "p-0 text-body text-fg",
  legendVisible: "mb-2",
  legendHidden: "sr-only",
  list: "flex flex-col",
  appearance: {
    list: {
      list: "gap-1",
      frame: "",
      frameChecked: "",
      label: "min-h-11 py-2",
      labelChecked: "min-h-11 py-2",
      panel: "pl-8",
    },
    card: {
      list: "gap-3",
      frame: "flex flex-col rounded-card border border-line bg-surface",
      frameChecked: "flex flex-col rounded-card border-2 border-accent bg-fill-selected",
      label: "p-4",
      labelChecked: "p-[15px]",
      panel: "px-[15px] pb-[15px] pl-[47px]",
    },
  },
  label: "flex cursor-pointer items-start gap-3 text-body text-fg",
  radio:
    "mt-0.5 grid size-5 shrink-0 cursor-pointer appearance-none place-content-center rounded-full border-2 border-control-line bg-surface before:size-2.5 before:rounded-full checked:border-accent checked:before:bg-accent forced-colors:checked:before:bg-[CanvasText]",
  text: "flex min-w-0 flex-1 flex-col gap-1",
  description: "text-small text-muted",
  trailing: "shrink-0",
  badge: "shrink-0",
} as const;
