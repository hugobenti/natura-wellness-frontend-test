import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { contrastRatio, readDarkColors, readThemeColors } from "@/shared/utils/colorContrast";

const css = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8");
const light = readThemeColors(css);
const darkOverrides = readDarkColors(css);
const schemes: Array<[string, Record<string, string>]> = [
  ["light", light],
  ["dark", { ...light, ...darkOverrides }],
];

// Text pairs need 4.5:1, UI pairs (focus rings, control borders, icons) 3:1. Add every new pair a
// component uses.
const textPairs: Array<[string, string]> = [
  ["fg", "bg"],
  ["fg", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["on-accent", "accent"],
  ["on-accent", "accent-hover"],
];

const uiPairs: Array<[string, string]> = [
  ["focus", "bg"],
  ["focus", "surface"],
];

describe.each(schemes)("%s scheme tokens meet WCAG 2.2 AA", (_name, tokens) => {
  function ratio(foreground: string, background: string): number {
    const fg = tokens[foreground];
    const bg = tokens[background];
    if (!fg || !bg) {
      throw new Error(`missing color token: ${!fg ? foreground : background}`);
    }
    return contrastRatio(fg, bg);
  }

  test.each(textPairs)("text %s on %s ≥ 4.5:1", (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(uiPairs)("UI %s on %s ≥ 3:1", (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(3);
  });
});

test("the dark scheme overrides every color token, so no light value leaks into it", () => {
  expect(Object.keys(darkOverrides).sort()).toEqual(Object.keys(light).sort());
});
