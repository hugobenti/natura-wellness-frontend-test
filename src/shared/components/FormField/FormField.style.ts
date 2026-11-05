export const formField = {
  base: "flex",
  layout: {
    stacked: "flex-col gap-1",
    inline: "flex-row flex-wrap items-center gap-x-3 gap-y-1",
  },
  label: "text-body text-fg",
  hint: "text-small text-muted",
  error: "flex items-center gap-1 text-small text-on-status-danger",
  errorIcon: "shrink-0",
} as const;
