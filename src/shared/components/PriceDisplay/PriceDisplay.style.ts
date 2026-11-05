export const priceDisplay = {
  base: "inline-flex items-baseline gap-2",
  price: "font-semibold tabular-nums",
  compareAt: "text-muted line-through tabular-nums",
  srOnly: "sr-only",
  size: {
    sm: "text-small",
    md: "text-body",
    lg: "text-section",
  },
  layout: {
    inline: "",
    stacked: "flex-col items-end gap-0",
  },
} as const;
