/**
 * WCAG 2.x contrast math for design tokens, plus readers for the `--color-*` tokens declared in
 * src/styles/globals.css: the `@theme` blocks (light scheme) and the `prefers-color-scheme: dark` block.
 */

const OPAQUE_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const THEME_BLOCK = /@theme\b[^{]*\{([^}]*)\}/g;
const DARK_BLOCK = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/;
const COLOR_DECLARATION = /--color-([a-z0-9-]+)\s*:\s*([^;]+);/gi;

/** WCAG 2.x relative luminance of an opaque #rgb / #rrggbb color, from 0 (black) to 1 (white). */
function relativeLuminance(hex: string): number {
  const digits = OPAQUE_HEX.exec(hex)?.[1];
  if (!digits) {
    // eslint-disable-next-line no-restricted-syntax -- developer error from the token contrast test, never shown to users
    throw new Error(`contrastRatio needs an opaque hex color, got "${hex}"`);
  }
  const full = digits.length === 3 ? digits.replace(/./g, (d) => d + d) : digits;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const channel = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function readColors(declarations: string, into: Record<string, string>) {
  for (const [, name, value] of declarations.matchAll(COLOR_DECLARATION)) {
    if (name && value) {
      into[name] = value.trim();
    }
  }
}

/**
 * Color tokens declared in `@theme` blocks, keyed by name without the `--color-` prefix.
 * The wildcard reset (`--color-*: initial`) doesn't match a token name and is skipped.
 */
export function readThemeColors(css: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const [, declarations = ""] of css.matchAll(THEME_BLOCK)) {
    readColors(declarations, colors);
  }
  return colors;
}

/** Color tokens the `@media (prefers-color-scheme: dark) { :root { … } }` block overrides. */
export function readDarkColors(css: string): Record<string, string> {
  const colors: Record<string, string> = {};
  readColors(DARK_BLOCK.exec(css)?.[1] ?? "", colors);
  return colors;
}
