/** Text the buy box adds to the provided copy in `src/part-b/copy.ts`: labels for assistive technology and joined strings. */
export const buyBoxContent = {
  imageAlt: "Natura Wellness Vitamin D, 60 softgels",
  purchaseLegend: "Purchase option",
  ratingLabel: (rating: string) => `Rated ${rating} out of 5 stars`,
  quantityLabel: "Quantity",
  /** Sits between the button label and the charge. */
  addToCartSeparator: "·",
} as const;
