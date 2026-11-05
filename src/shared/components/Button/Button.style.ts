export const button = {
  base: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border text-body disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress",
  variant: {
    primary: "border-transparent bg-accent text-on-accent hover:bg-accent-hover",
    secondary: "border-control-line bg-surface text-fg",
    quiet: "border-transparent text-fg underline underline-offset-4",
    destructive: "border-on-status-danger bg-surface text-on-status-danger",
  },
  size: {
    md: "min-h-11 px-4 py-2",
    lg: "min-h-12 px-6 py-3",
    icon: "size-11 shrink-0 p-0",
  },
  fullWidth: "w-full",
  spinner:
    "size-4 shrink-0 animate-spin rounded-pill border-2 border-current border-t-transparent motion-reduce:animate-none",
} as const;
