export interface ITheme {
  /** `"brand"` for the `@theme` + `:root` layer, else the `[data-theme="…"]` value. */
  name: string;
  /** Semantic colors keyed without `--color-`, resolved to their final literal. */
  colors: Record<string, string>;
  /** Font families keyed without `--font-`, resolved to their final literal. */
  fonts: Record<string, string>;
  /** Corner radii keyed by role without `--radius-`, resolved to their final literal. */
  radii: Record<string, string>;
  /** The theme's own non-semantic custom properties, keyed by full name. */
  primitives: Record<string, string>;
  /** Semantic names the block itself declares (`bg`, `font:sans`, `radius:card`…). */
  declared: string[];
}

export interface ITypeStep {
  /** The step name without `--text-`, as in the utility `text-<name>`. */
  name: string;
  size: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}
