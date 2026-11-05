export interface IContrastPair {
  fg: string;
  bg: string;
  /** `text` needs 4.5:1; `ui` (focus rings, control borders, icons) needs 3:1. */
  kind: "text" | "ui";
}
