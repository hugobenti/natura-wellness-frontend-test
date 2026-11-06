export const skipSheet = {
  facts: "space-y-4 text-body",
  fact: "flex items-start justify-between gap-4",
  factLabel: "text-muted",
  factValue: "text-right text-fg",
  dates: "flex flex-wrap items-center justify-end gap-2",
  oldDate: "text-muted line-through",
  newDate: "font-semibold text-fg",
  srOnly: "sr-only",
  note: "mt-4 text-small text-muted",
  alert: "mb-4",
  alertSupport: "-ml-4",
  changes: "mt-2 list-disc space-y-1 pl-5 text-small",
  changedLabel: "font-semibold text-fg",
  changedOldDate:
    "font-semibold text-fg line-through underline decoration-accent decoration-2 underline-offset-4",
  changedValue: "font-semibold text-fg underline decoration-accent decoration-2 underline-offset-4",
} as const;
