/** The theme contract: every theme defines every semantic color and font role below. */
export const semanticColorTokens: readonly string[] = [
  "bg",
  "surface",
  "line",
  "control-line",
  "fg",
  "muted",
  "accent",
  "accent-hover",
  "on-accent",
  "focus",
  "fill-soft",
  "fill-selected",
  "decor",
  "status-active",
  "on-status-active",
  "status-paused",
  "on-status-paused",
  "status-cancelled",
  "on-status-cancelled",
  "status-danger",
  "on-status-danger",
];

export const fontRoles = ["sans", "heading"] as const;
