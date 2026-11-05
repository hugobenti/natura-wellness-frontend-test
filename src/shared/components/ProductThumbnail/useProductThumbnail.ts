import { useState } from "react";
import { initialOf } from "@/shared/logic/initial";
import type { IUseProductThumbnailArgs } from "./ProductThumbnail.type";

/** Decides between the image and the initial tile. A load error only counts for the `src` that failed. */
export function useProductThumbnail({ src, name, decorative }: IUseProductThumbnailArgs) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return {
    showImage: src !== null && src !== failedSrc,
    onError: () => setFailedSrc(src),
    alt: decorative ? "" : name,
    initial: initialOf(name),
    tileLabel: decorative ? undefined : name,
  };
}
