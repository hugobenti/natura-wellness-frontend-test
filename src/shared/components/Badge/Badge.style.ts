export const badge = {
  base: "inline-flex items-center gap-1 rounded-pill px-2 py-1",
  tone: {
    highlight: "bg-highlight text-on-highlight text-eyebrow uppercase",
    active: "bg-status-active text-on-status-active text-small font-semibold",
    paused: "bg-status-paused text-on-status-paused text-small font-semibold",
    cancelled: "bg-status-cancelled text-on-status-cancelled text-small font-semibold",
    danger: "bg-status-danger text-on-status-danger text-small font-semibold",
  },
} as const;
