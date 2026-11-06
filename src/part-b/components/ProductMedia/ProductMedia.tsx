import { productMedia } from "./ProductMedia.style";
import type { IProductMediaProps } from "./ProductMedia.type";

/** The product photo in a square panel. */
export function ProductMedia({ alt }: IProductMediaProps) {
  return (
    <div className={productMedia.panel}>
      <img src="/product.jpg" alt={alt} width={1024} height={1024} className={productMedia.image} />
    </div>
  );
}
