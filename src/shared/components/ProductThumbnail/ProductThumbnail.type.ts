import type { productThumbnail } from "./ProductThumbnail.style";

export interface IProductThumbnailProps {
  /** Image URL; `null` shows the initial tile. A URL that fails to load falls back to the tile too. */
  src: string | null;
  name: string;
  size?: keyof typeof productThumbnail.size;
  /** Hides the thumbnail from assistive tech when the product name is already next to it. */
  decorative?: boolean;
  className?: string;
}

export interface IUseProductThumbnailArgs {
  src: string | null;
  name: string;
  decorative: boolean;
}
