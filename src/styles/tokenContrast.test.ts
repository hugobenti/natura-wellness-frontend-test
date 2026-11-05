import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { contrastRatio } from "@/shared/utils/colorContrast";

import { contrastPairs, minimumRatio } from "./contrastPairs";
import { fontRoles, radiusRoles, semanticColorTokens } from "./themeContract";
import { readThemes } from "./themeTokens";
import { themeNames } from "./themes";
import type { TThemeName } from "./themes.type";

const themes = readThemes(readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf8"));

describe.each(themes)("$name theme tokens meet WCAG 2.2 AA", ({ colors }) => {
  test.each(contrastPairs)("$kind $fg on $bg", ({ fg, bg, kind }) => {
    const foreground = colors[fg];
    const background = colors[bg];
    if (!foreground || !background) {
      throw new Error(`missing color token: ${!foreground ? fg : bg}`);
    }
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimumRatio(kind));
  });
});

test("every theme declares the full contract", () => {
  const contract = [
    ...semanticColorTokens,
    ...fontRoles.map((role) => `font:${role}`),
    ...radiusRoles.map((role) => `radius:${role}`),
  ];
  for (const theme of themes.filter(({ name }) => name !== "brand")) {
    expect(theme.declared, theme.name).toEqual(expect.arrayContaining(contract));
  }
  const brand = themes.find(({ name }) => name === "brand");
  expect([...(brand?.declared ?? [])].sort()).toEqual([...contract].sort());
});

test("the theme picker lists every theme", () => {
  const names: TThemeName[] = [...themeNames];
  expect(themes.map(({ name }) => name)).toEqual(names);
});
