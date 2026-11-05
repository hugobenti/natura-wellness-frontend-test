import { cx } from "@/shared/utils/cx";
import { priceDisplay } from "./PriceDisplay.style";
import type { IPriceDisplayProps } from "./PriceDisplay.type";
import { usePriceDisplay } from "./usePriceDisplay";

/** Formatted price, with an optional crossed-out original price. */
export function PriceDisplay({
  amountCents,
  compareAtCents,
  size = "md",
  layout = "inline",
  className,
}: IPriceDisplayProps) {
  const { price, compareAt, compareAtLabel } = usePriceDisplay({ amountCents, compareAtCents });

  return (
    <span className={cx(priceDisplay.base, priceDisplay.layout[layout], className)}>
      <span className={cx(priceDisplay.price, priceDisplay.size[size])}>{price}</span>
      {compareAt ? (
        <>
          <span aria-hidden="true" className={priceDisplay.compareAt}>
            {compareAt}
          </span>
          <span className={priceDisplay.srOnly}>{compareAtLabel}</span>
        </>
      ) : null}
    </span>
  );
}
