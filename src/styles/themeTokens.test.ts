import { describe, expect, test } from "vitest";

import { readThemes, readTypeScale } from "./themeTokens";

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
    expect(alt?.primitives).toEqual({ "--p-b": "#000000" });
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

  test("reads radius roles with the same inheritance as fonts", () => {
    const [brand, alt] = readThemes(
      `@theme static { --radius-*: initial; --radius-control: 10px; }\n[data-theme="alt"] { --radius-control: 4px; }`,
    );
    expect(brand?.radii["control"]).toBe("10px");
    expect(alt?.radii["control"]).toBe("4px");
    expect(alt?.declared).toContain("radius:control");
  });
});

describe("type steps in a theme block", () => {
  test("are typography, not palette: they never appear as primitives", () => {
    const alt = readThemes(
      `${brandCss}\n[data-theme="alt"] { --p-b: #000000; --text-big: 44px; --text-big--font-weight: 500; }`,
    ).find((theme) => theme.name === "alt");
    expect(alt?.primitives).toEqual({ "--p-b": "#000000" });
  });
});

describe("readTypeScale", () => {
  test("lists steps in source order with their sub-properties", () => {
    const css = `
@theme static {
  --text-*: initial;
  --text-big: 28px;
  --text-big--line-height: 1.15;
  --text-big--letter-spacing: -0.02em;
  --text-big--font-weight: 700;
  --text-tiny: 11px;
  --text-tiny--line-height: 1.3;
  --text-tiny--letter-spacing: 0.12em;
  --text-tiny--font-weight: 600;
}
`;
    expect(readTypeScale(css)).toEqual([
      {
        name: "big",
        size: "28px",
        lineHeight: "1.15",
        letterSpacing: "-0.02em",
        fontWeight: "700",
      },
      { name: "tiny", size: "11px", lineHeight: "1.3", letterSpacing: "0.12em", fontWeight: "600" },
    ]);
  });
  test("a theme overrides only the sub-properties it declares, keeping source order", () => {
    const css = `
@theme static {
  --text-*: initial;
  --text-big: 28px;
  --text-big--line-height: 1.15;
  --text-big--letter-spacing: -0.02em;
  --text-big--font-weight: 700;
  --text-tiny: 11px;
  --text-tiny--line-height: 1.3;
  --text-tiny--letter-spacing: 0.12em;
  --text-tiny--font-weight: 600;
}
[data-theme="alt"] { --text-big: 44px; --text-big--font-weight: 500; }
`;
    expect(readTypeScale(css, "alt")).toEqual([
      {
        name: "big",
        size: "44px",
        lineHeight: "1.15",
        letterSpacing: "-0.02em",
        fontWeight: "500",
      },
      { name: "tiny", size: "11px", lineHeight: "1.3", letterSpacing: "0.12em", fontWeight: "600" },
    ]);
    expect(readTypeScale(css, "brand")[0]?.size).toBe("28px");
    expect(readTypeScale(css)[0]?.size).toBe("28px");
  });
});
