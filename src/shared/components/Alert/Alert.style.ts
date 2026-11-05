export const alert = {
  base: "flex items-start gap-3 rounded-card p-4",
  icon: "mt-0.5 shrink-0",
  body: "flex min-w-0 flex-1 flex-col gap-1",
  title: "text-body font-semibold",
  action: "shrink-0",
  tone: {
    success: "bg-status-active text-on-status-active",
    info: "bg-fill-soft text-fg",
    danger: "bg-status-danger text-on-status-danger",
  },
} as const;
