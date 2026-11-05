import { subscriptionContent } from "@/content/subscription";
import { Badge } from "@/shared/components/Badge/Badge";
import { Button } from "@/shared/components/Button/Button";
import { PriceDisplay } from "@/shared/components/PriceDisplay/PriceDisplay";
import { ProductThumbnail } from "@/shared/components/ProductThumbnail/ProductThumbnail";
import { QuantityStepper } from "@/shared/components/QuantityStepper/QuantityStepper";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { cx } from "@/shared/utils/cx";
import { MAX_QUANTITY } from "../../logic/editDraft";
import { receiptCard } from "./ReceiptCard.style";
import type { IReceiptCardProps } from "./ReceiptCard.type";

export function ReceiptCard({ heading, status, lines, footer, headingRef }: IReceiptCardProps) {
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
          <div
            key={line.sku}
            className={cx(
              receiptCard.row,
              line.edit ? receiptCard.rowEdit : receiptCard.rowRead,
            )}
          >
            <ProductThumbnail
              src={line.imageUrl}
              name={line.name}
              size="md"
              decorative
              className={cx((status === "paused" || line.priceCents === null) && receiptCard.dimmed)}
            />
            <div className={receiptCard.details}>
              <p className={receiptCard.name}>{line.name}</p>
              {!line.edit && <p className={receiptCard.mobileQuantity}>{line.quantityLabel}</p>}
              {line.skippedNote && !line.edit?.undo && (
                <p className={receiptCard.skippedNote}>{line.skippedNote}</p>
              )}
              {line.edit?.lastItemHint && (
                <p className={receiptCard.lastItemHint}>{line.edit.lastItemHint}</p>
              )}
            </div>
            {line.edit ? (
              !line.skippedNote && (
                <div className={receiptCard.editorStepper}>
                  <QuantityStepper
                    value={line.edit.quantity}
                    onChange={line.edit.onQuantityChange}
                    min={1}
                    max={MAX_QUANTITY}
                    label={line.edit.stepperLabel}
                    labelHidden
                  />
                </div>
              )
            ) : (
              <span className={receiptCard.desktopQuantity}>{line.quantityLabel}</span>
            )}
            {line.priceCents !== null && (
              <PriceDisplay
                amountCents={line.priceCents}
                compareAtCents={line.compareAtCents ?? undefined}
                layout="stacked"
                className={receiptCard.price}
              />
            )}
            {line.edit?.skip && (
              <div className={receiptCard.editorAction}>
                <Button
                  variant="quiet"
                  size="md"
                  aria-label={line.edit.skip.label}
                  onClick={line.edit.skip.onClick}
                >
                  {subscriptionContent.edit.skipOnce}
                </Button>
              </div>
            )}
            {line.edit?.undo && (
              <div className={receiptCard.skippedAction}>
                <p className={cx(receiptCard.skippedRowNote, receiptCard.dimmed)}>
                  {line.edit.skippedNote}
                </p>
                <Button
                  variant="quiet"
                  size="md"
                  aria-label={line.edit.undo.label}
                  onClick={line.edit.undo.onClick}
                >
                  {subscriptionContent.edit.undo}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <footer className={receiptCard.footer}>
        <div className={receiptCard.footerText}>
          <p className={receiptCard.footerLabel}>{footer.label}</p>
          {footer.sublabel && <p className={receiptCard.footerSublabel}>{footer.sublabel}</p>}
        </div>
        {footer.kind !== "note" && (
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
