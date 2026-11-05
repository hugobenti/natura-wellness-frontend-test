export const formField = {
  base: "flex gap-1",
  layout: {
    stacked: "flex-col",
    inline: "flex-row flex-wrap items-center gap-x-3",
  },
  label: "text-body text-fg",
  hint: "text-small text-muted",
  error: "flex items-center gap-1 text-small text-on-status-danger",
  errorIcon: "shrink-0",
} as const;
