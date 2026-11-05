import type { ITheme, ITypeStep } from "./themeTokens.type";

/**
 * Reads the themes declared in src/styles/globals.css: the brand theme (every `@theme` block plus
 * `:root`) and one theme per `[data-theme="x"]` block. Blocks never nest.
 */

const COMMENT = /\/\*[\s\S]*?\*\//g;
const BLOCK = /(@theme\b[^{]*|:root|\[data-theme="([^"]+)"\])\s*\{([^}]*)\}/g;
// Wildcard resets (`--color-*: initial`) never match: `*` isn't a name character.
const DECLARATION = /(?<![\w-])(--[\w-]+)\s*:\s*([^;]+);/g;
const VAR = /var\(\s*(--[\w-]+)\s*(,[^)]*)?\)/g;

function declarations(body: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(DECLARATION)) {
    if (name && value) {
      found[name] = value.trim();
    }
  }
  return found;
}

function resolve(value: string, vars: Record<string, string>, chain: string[]): string {
  return value.replace(VAR, (_match, name: string, fallback: string | undefined) => {
    if (fallback !== undefined) {
      // eslint-disable-next-line no-restricted-syntax -- developer error from the theme reader, never shown to users
      throw new Error(`var(${name}, fallback) is not supported`);
    }
    const target = vars[name];
    if (target === undefined) {
      // eslint-disable-next-line no-restricted-syntax -- developer error from the theme reader, never shown to users
      throw new Error(`unresolved var(${name})`);
    }
    if (chain.includes(name)) {
      // eslint-disable-next-line no-restricted-syntax -- developer error from the theme reader, never shown to users
      throw new Error(`circular var(${name})`);
    }
    return resolve(target, vars, [...chain, name]);
  });
}

function semanticName(property: string): string | undefined {
  if (property.startsWith("--color-")) {
    return property.slice("--color-".length);
  }
  if (property.startsWith("--font-")) {
    return `font:${property.slice("--font-".length)}`;
  }
  return undefined;
}

function buildTheme(
  name: string,
  inherited: ITheme | undefined,
  vars: Record<string, string>,
  semanticProperties: string[],
  primitiveProperties: string[],
): ITheme {
  const theme: ITheme = {
    name,
    colors: { ...inherited?.colors },
    fonts: { ...inherited?.fonts },
    primitives: {},
    declared: [],
  };
  for (const property of primitiveProperties) {
    theme.primitives[property] = resolve(vars[property] ?? "", vars, [property]);
  }
  for (const property of semanticProperties) {
    const semantic = semanticName(property);
    if (semantic === undefined) {
      continue;
    }
    const value = resolve(vars[property] ?? "", vars, [property]);
    if (semantic.startsWith("font:")) {
      theme.fonts[semantic.slice("font:".length)] = value;
    } else {
      theme.colors[semantic] = value;
    }
    theme.declared.push(semantic);
  }
  return theme;
}

/** The brand theme first, then every `[data-theme]` block in source order. */
export function readThemes(css: string): ITheme[] {
  const blocks = [...css.replace(COMMENT, "").matchAll(BLOCK)];

  const brandVars: Record<string, string> = {};
  const brandSemantic: string[] = [];
  const brandPrimitives: string[] = [];
  for (const [, selector = "", , body = ""] of blocks) {
    if (selector.startsWith("[")) {
      continue;
    }
    const isTheme = selector.startsWith("@theme");
    for (const [property, value] of Object.entries(declarations(body))) {
      brandVars[property] = value;
      if (!isTheme) {
        brandPrimitives.push(property);
      } else if (semanticName(property) !== undefined) {
        brandSemantic.push(property);
      }
    }
  }
  const brand = buildTheme("brand", undefined, brandVars, brandSemantic, brandPrimitives);

  const themes = [brand];
  for (const [, , themeName, body = ""] of blocks) {
    if (themeName === undefined) {
      continue;
    }
    const own = declarations(body);
    const properties = Object.keys(own);
    themes.push(
      buildTheme(
        themeName,
        brand,
        { ...brandVars, ...own },
        properties.filter((property) => semanticName(property) !== undefined),
        properties.filter((property) => semanticName(property) === undefined),
      ),
    );
  }
  return themes;
}

const TYPE_STEP = /^--text-([\w-]+)$/;

/** The `--text-<step>` family of every `@theme` block, in source order. Skips the `--text-*` reset. */
export function readTypeScale(css: string): ITypeStep[] {
  const vars: Record<string, string> = {};
  for (const [, selector = "", , body = ""] of css.replace(COMMENT, "").matchAll(BLOCK)) {
    if (selector.startsWith("@theme")) {
      Object.assign(vars, declarations(body));
    }
  }
  const part = (step: string, suffix: string) => {
    const value = vars[`--text-${step}--${suffix}`];
    if (value === undefined) {
      // eslint-disable-next-line no-restricted-syntax -- developer error from the theme reader, never shown to users
      throw new Error(`Type step "${step}" misses --text-${step}--${suffix}`);
    }
    return value;
  };
  return Object.entries(vars).flatMap(([property, size]) => {
    const step = TYPE_STEP.exec(property)?.[1];
    if (step === undefined || step.includes("--")) {
      return [];
    }
    return [
      {
        name: step,
        size,
        lineHeight: part(step, "line-height"),
        letterSpacing: part(step, "letter-spacing"),
        fontWeight: part(step, "font-weight"),
      },
    ];
  });
}
