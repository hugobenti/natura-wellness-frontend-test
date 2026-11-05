import { cx } from "@/shared/utils/cx";
import { productThumbnail } from "./ProductThumbnail.style";
import type { IProductThumbnailProps } from "./ProductThumbnail.type";
import { useProductThumbnail } from "./useProductThumbnail";

/** Product image, or a tile with the product's initial when there is no image or it fails to load. */
export function ProductThumbnail({
  src,
  name,
  size = "md",
  decorative = false,
  className,
}: IProductThumbnailProps) {
  const { showImage, onError, alt, initial, tileLabel } = useProductThumbnail({
    src,
    name,
    decorative,
  });

  if (showImage && src) {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        className={cx(
          productThumbnail.base,
          productThumbnail.image,
          productThumbnail.size[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={tileLabel}
      aria-hidden={decorative ? true : undefined}
      className={cx(
        productThumbnail.base,
        productThumbnail.tile,
        productThumbnail.size[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
