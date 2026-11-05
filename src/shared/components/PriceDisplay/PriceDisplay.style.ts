export const priceDisplay = {
  base: "inline-flex",
  price: "font-semibold tabular-nums",
  compareAt: "text-small text-muted line-through tabular-nums",
  srOnly: "sr-only",
  size: {
    sm: "text-small",
    md: "text-body",
    lg: "text-section",
  },
  layout: {
    inline: "items-baseline gap-2",
    stacked: "flex-col items-end gap-0",
  },
} as const;
