import type { IContrastPair } from "./contrastPairs.type";

/** Every text/UI color pair a theme must keep legible. Add each new pair a component uses. */
export const contrastPairs: readonly IContrastPair[] = [
  { fg: "fg", bg: "bg", kind: "text" },
  { fg: "fg", bg: "surface", kind: "text" },
  { fg: "muted", bg: "bg", kind: "text" },
  { fg: "muted", bg: "surface", kind: "text" },
  { fg: "on-accent", bg: "accent", kind: "text" },
  { fg: "on-accent", bg: "accent-hover", kind: "text" },
  { fg: "accent", bg: "surface", kind: "text" },
  { fg: "accent", bg: "bg", kind: "text" },
  { fg: "fg", bg: "fill-soft", kind: "text" },
  { fg: "muted", bg: "fill-soft", kind: "text" },
  { fg: "fg", bg: "fill-selected", kind: "text" },
  { fg: "on-status-active", bg: "status-active", kind: "text" },
  { fg: "on-status-paused", bg: "status-paused", kind: "text" },
  { fg: "on-status-cancelled", bg: "status-cancelled", kind: "text" },
  { fg: "on-status-danger", bg: "status-danger", kind: "text" },
  { fg: "on-status-danger", bg: "surface", kind: "text" },
  { fg: "on-status-danger", bg: "bg", kind: "text" },
  { fg: "accent", bg: "fill-selected", kind: "ui" },
  { fg: "on-highlight", bg: "highlight", kind: "text" },
  { fg: "control-line", bg: "surface", kind: "ui" },
  { fg: "control-line", bg: "bg", kind: "ui" },
  { fg: "focus", bg: "bg", kind: "ui" },
  { fg: "focus", bg: "surface", kind: "ui" },
  { fg: "decor", bg: "surface", kind: "ui" },
  { fg: "decor", bg: "bg", kind: "ui" },
];

export function minimumRatio(kind: IContrastPair["kind"]): number {
  return kind === "text" ? 4.5 : 3;
}
