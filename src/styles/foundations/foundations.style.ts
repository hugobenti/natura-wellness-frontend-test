/** Layout and specimen styles of the Foundations pages. Token colors are set inline from the token's CSS variable. */
export const foundation = {
  grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  card: "flex flex-col gap-2 rounded-lg border border-line bg-surface p-4",
  swatch: "h-16 rounded-md border border-line",
  name: "text-small font-semibold text-fg",
  value: "text-small text-muted",
  description: "text-small text-muted",
  note: "mb-4 max-w-2xl text-small text-muted",
  pills: "flex flex-wrap gap-3",
  pillBase: "inline-flex items-center gap-2 rounded-full px-3 py-1 text-small font-semibold",
  pill: {
    active: "bg-status-active text-on-status-active",
    paused: "bg-status-paused text-on-status-paused",
    cancelled: "bg-status-cancelled text-on-status-cancelled",
    danger: "bg-status-danger text-on-status-danger",
  },
  table: "w-full border-collapse text-left text-small",
  caption: "mb-3 text-left text-eyebrow font-semibold text-muted uppercase",
  headCell: "border-b border-line py-2 pr-4 text-eyebrow font-semibold text-muted uppercase",
  cell: "border-b border-line py-3 pr-4 align-middle text-muted",
  cellName: "border-b border-line py-3 pr-4 text-left align-middle font-semibold text-fg",
  sample:
    "inline-flex min-w-16 items-center justify-center rounded-sm border border-line px-3 py-1 font-semibold",
  shape: "inline-block h-6 w-16 rounded-sm border-2",
} as const;
