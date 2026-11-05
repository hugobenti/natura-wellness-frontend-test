import { describe, expect, test } from "vitest";

import { readThemes } from "./themeTokens";

const brandCss = `
@theme static {
  --color-*: initial;
  --color-bg: var(--p-a);
  --font-sans: "X", sans-serif;
}
:root { --p-a: #ffffff; }
`;

describe("readThemes", () => {
  test("resolves semantic colors through primitives", () => {
    const [brand] = readThemes(brandCss);
    expect(brand?.name).toBe("brand");
    expect(brand?.colors["bg"]).toBe("#ffffff");
    expect(brand?.fonts["sans"]).toBe('"X", sans-serif');
    expect(brand?.primitives["--p-a"]).toBe("#ffffff");
  });

  test("a data-theme block overrides brand and reports what it declares", () => {
    const themes = readThemes(
      `${brandCss}\n[data-theme="alt"] { --p-b: #000000; --color-bg: var(--p-b); }`,
    );
    const alt = themes.find((theme) => theme.name === "alt");
    expect(themes.map((theme) => theme.name)).toEqual(["brand", "alt"]);
    expect(alt?.colors["bg"]).toBe("#000000");
    expect(alt?.declared).toContain("bg");
    expect(alt?.declared).not.toContain("font:sans");
    expect(alt?.fonts["sans"]).toBe('"X", sans-serif');
  });

  test("follows var() chains", () => {
    const [brand] = readThemes(
      "@theme static { --color-bg: var(--a); } :root { --a: var(--b); --b: var(--c); --c: #123456; }",
    );
    expect(brand?.colors["bg"]).toBe("#123456");
  });

  test("throws on a dangling var()", () => {
    expect(() => readThemes("@theme static { --color-bg: var(--missing); }")).toThrow(/--missing/);
  });

  test("throws on the unsupported var() fallback form", () => {
    expect(() => readThemes("@theme static { --color-bg: var(--missing, #fff); }")).toThrow(
      /--missing/,
    );
  });
});
