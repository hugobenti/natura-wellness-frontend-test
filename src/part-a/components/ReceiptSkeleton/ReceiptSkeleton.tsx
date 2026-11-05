import { subscriptionContent } from "@/content/subscription";
import { receiptSkeleton } from "./ReceiptSkeleton.style";

export function ReceiptSkeleton() {
  return (
    <div role="status" className={receiptSkeleton.card}>
      <p className={receiptSkeleton.label}>{subscriptionContent.loading}</p>
      <div aria-hidden="true">
        <div className={receiptSkeleton.row}>
          <span className={receiptSkeleton.tile} />
          <div className={receiptSkeleton.line} />
        </div>
        <div className={receiptSkeleton.row}>
          <span className={receiptSkeleton.tile} />
          <div className={receiptSkeleton.line} />
        </div>
        <div className={receiptSkeleton.row}>
          <span className={receiptSkeleton.footer} />
        </div>
      </div>
    </div>
  );
}
