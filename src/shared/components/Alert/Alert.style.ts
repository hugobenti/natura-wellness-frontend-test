export const alert = {
  base: "relative flex flex-wrap items-start gap-x-3 gap-y-2 rounded-card py-4 pl-4",
  padding: {
    plain: "pr-4",
    dismissible: "pr-14",
  },
  icon: "mt-0.5 shrink-0",
  body: "flex min-w-0 flex-1 basis-60 flex-col gap-1",
  title: "text-body font-semibold",
  action: "basis-full pl-3 sm:basis-auto sm:self-center sm:pl-0",
  dismiss: "absolute top-1 right-1",
  tone: {
    success: "bg-status-active text-on-status-active",
    info: "bg-fill-soft text-fg",
    danger: "bg-status-danger text-on-status-danger",
  },
} as const;
