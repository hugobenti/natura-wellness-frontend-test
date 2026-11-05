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
    const indices = lines.map((_, index) => index);
    indices.sort(
      (a, b) =>
        ((lines[b].compareAtCents * factor) % 100) - ((lines[a].compareAtCents * factor) % 100) ||
        a - b,
    );
    for (let i = 0; i < remainder; i++) {
      lines[indices[i]].priceCents++;
    }
  }

  return { lines, subtotalCents, totalCents, savingCents: subtotalCents - totalCents };
}
