import type { Subscription } from "@/api/types";
import { priceBox } from "./pricing";
import type { ILocalOverlay, ISubscriptionView } from "./subscriptionView.type";

export const EMPTY_OVERLAY: ILocalOverlay = {
  quantities: {},
  skippedSkus: [],
  zeroSkus: [],
  intervalDays: null,
  cancelReason: null,
  cancelNote: null,
  lifecycle: null,
};

export function deriveView(snapshot: Subscription, overlay: ILocalOverlay): ISubscriptionView {
  const lifecycle = overlay.lifecycle;
  const status = lifecycle?.status ?? snapshot.status;
  const nextChargeAt = lifecycle
    ? lifecycle.status === "active"
      ? lifecycle.nextChargeAt
      : null
    : snapshot.nextChargeAt;
  const pausedUntil = lifecycle
    ? lifecycle.status === "paused"
      ? lifecycle.pausedUntil
      : null
    : snapshot.pausedUntil;
  const cancelledAt = lifecycle
    ? lifecycle.status === "cancelled"
      ? lifecycle.cancelledAt
      : null
    : snapshot.cancelledAt;

  const allItems = snapshot.items.map((item) => ({
    ...item,
    quantity: overlay.quantities[item.sku] ?? item.quantity,
  }));

  const items = allItems.filter(
    (item) => status !== "active" || !overlay.skippedSkus.includes(item.sku),
  );
  const pricing = priceBox(items, snapshot.discountPercent);
  let pricedIndex = 0;
  const lines = allItems.map((item) => {
    const skipped = status === "active" && overlay.skippedSkus.includes(item.sku);
    const priced = skipped ? null : pricing.lines[pricedIndex++];
    return {
      sku: item.sku,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity:
        skipped && overlay.zeroSkus.includes(item.sku)
          ? 0
          : (overlay.quantities[item.sku] ?? item.quantity),
      skipped,
      priceCents: priced?.priceCents ?? null,
      compareAtCents: priced?.compareAtCents ?? null,
    };
  });

  return {
    id: snapshot.id,
    updatedAt: snapshot.updatedAt,
    status,
    nextChargeAt,
    pausedUntil,
    cancelledAt,
    intervalDays: overlay.intervalDays ?? snapshot.intervalDays,
    discountPercent: snapshot.discountPercent,
    lines,
    pricing,
    skipIsLocal: lifecycle !== null || overlay.intervalDays !== null,
  };
}
