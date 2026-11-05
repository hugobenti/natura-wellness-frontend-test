import { totalAfterDiscount } from "@/api/fixtures";
import type { SubscriptionItem } from "@/api/types";
import type { IBoxPricing } from "./pricing.type";

export function priceBox(
  items: ReadonlyArray<SubscriptionItem>,
  discountPercent: number,
): IBoxPricing {
  let subtotalCents = 0;
  let allocatedCents = 0;
  const factor = 100 - discountPercent;
  const lines = items.map(({ sku, unitPriceCents, quantity }) => {
    const compareAtCents = unitPriceCents * quantity;
    const priceCents = Math.floor((compareAtCents * factor) / 100);
    subtotalCents += compareAtCents;
    allocatedCents += priceCents;
    return { sku, priceCents, compareAtCents };
  });
  const totalCents = totalAfterDiscount([...items], discountPercent);
  const remainder = totalCents - allocatedCents;
  if (remainder > 0) {
    // Stable sorting preserves the original line order for equal remainders.
    const ranked = [...lines].sort(
      (a, b) => ((b.compareAtCents * factor) % 100) - ((a.compareAtCents * factor) % 100),
    );
    for (let i = 0; i < remainder; i++) {
      ranked[i]!.priceCents++;
    }
  }

  return { lines, subtotalCents, totalCents, savingCents: subtotalCents - totalCents };
}
