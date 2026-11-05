export const responsiveDialog = {
  dialog:
    "fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none flex-col rounded-t-card bg-surface p-0 pb-[env(safe-area-inset-bottom)] text-fg opacity-0 transition-opacity duration-200 backdrop:bg-fg/40 open:flex open:opacity-100 starting:open:opacity-0 motion-reduce:transition-none sm:inset-y-0 sm:m-auto sm:max-w-md sm:rounded-card",
  header: "flex items-start justify-between gap-3 p-4 pb-2",
  title: "text-section",
  description: "px-4 text-body text-muted",
  body: "min-h-0 flex-1 overflow-y-auto p-4",
  footer: "flex flex-col gap-3 p-4 pt-2 sm:flex-row sm:justify-end",
} as const;
