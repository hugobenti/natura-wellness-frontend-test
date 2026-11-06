import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import type { ISubscriptionView } from "./subscriptionView.type";

export function deriveReceiptPresentation(view: ISubscriptionView) {
  const inactive = view.status !== "active";
  return {
    groupLabel:
      view.status === "paused"
        ? subscriptionContent.receipt.pausedGroup
        : view.status === "cancelled"
          ? subscriptionContent.receipt.cancelledGroup
          : null,
    lines: view.lines.map((line) => ({
      ...line,
      compareAtCents: inactive ? null : line.compareAtCents,
      mutedPrice: inactive && line.priceCents !== null ? formatMoney(line.priceCents) : null,
    })),
  };
}
