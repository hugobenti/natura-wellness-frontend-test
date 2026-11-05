import { Badge } from "@/shared/components/Badge/Badge";
import { PriceDisplay } from "@/shared/components/PriceDisplay/PriceDisplay";
import { ProductThumbnail } from "@/shared/components/ProductThumbnail/ProductThumbnail";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { cx } from "@/shared/utils/cx";
import { receiptCard } from "./ReceiptCard.style";
import type { IReceiptCardProps } from "./ReceiptCard.type";

export function ReceiptCard({
  heading,
  status,
  dimmed,
  lines,
  footer,
  headingRef,
}: IReceiptCardProps) {
  return (
    <section className={receiptCard.card}>
      <header className={receiptCard.header}>
        <h2 ref={headingRef} tabIndex={-1} className={receiptCard.heading}>
          {heading}
        </h2>
        <StatusBadge status={status} />
      </header>
      <div>
        {lines.map((line) => (
          <div key={line.sku} className={cx(receiptCard.row, dimmed && receiptCard.dimmed)}>
            <ProductThumbnail src={line.imageUrl} name={line.name} size="md" decorative />
            <div className={receiptCard.details}>
              <p className={receiptCard.name}>{line.name}</p>
              <p className={receiptCard.mobileQuantity}>{line.quantityLabel}</p>
            </div>
            <span className={receiptCard.desktopQuantity}>{line.quantityLabel}</span>
            {line.priceCents !== null && (
              <PriceDisplay
                amountCents={line.priceCents}
                compareAtCents={line.compareAtCents ?? undefined}
                layout="stacked"
                className={receiptCard.price}
              />
            )}
          </div>
        ))}
      </div>
      <footer className={receiptCard.footer}>
        <div className={receiptCard.footerText}>
          <p className={receiptCard.footerLabel}>{footer.label}</p>
          {footer.sublabel && <p className={receiptCard.footerSublabel}>{footer.sublabel}</p>}
        </div>
        {footer.kind === "charge" && (
          <div className={receiptCard.footerAmount}>
            <PriceDisplay
              amountCents={footer.totalCents}
              compareAtCents={footer.compareAtCents}
              size="lg"
              layout="stacked"
            />
            <Badge tone="highlight">{footer.savingLabel}</Badge>
          </div>
        )}
      </footer>
    </section>
  );
}
