export interface ITheme {
  /** `"brand"` for the `@theme` + `:root` layer, else the `[data-theme="…"]` value. */
  name: string;
  /** Semantic colors keyed without `--color-`, resolved to their final literal. */
  colors: Record<string, string>;
  /** Font families keyed without `--font-`, resolved to their final literal. */
  fonts: Record<string, string>;
  /** The theme's own non-semantic custom properties, keyed by full name. */
  primitives: Record<string, string>;
  /** Semantic names the block itself declares (`bg`, `font:sans`…). */
  declared: string[];
}
