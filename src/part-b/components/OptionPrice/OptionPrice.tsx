import { usePriceDisplay } from "@/shared/components/PriceDisplay/usePriceDisplay";
import { optionPrice } from "./OptionPrice.style";
import type { IOptionPriceProps } from "./OptionPrice.type";

/** A price with the original price crossed out underneath, right-aligned. */
export function OptionPrice({ amountCents, compareAtCents }: IOptionPriceProps) {
  const { price, compareAt, compareAtLabel } = usePriceDisplay({ amountCents, compareAtCents });

  return (
    <span className={optionPrice.base}>
      <span className={optionPrice.price}>{price}</span>
      {compareAt ? (
        <>
          <span aria-hidden="true" className={optionPrice.compareAt}>
            {compareAt}
          </span>
          <span className={optionPrice.srOnly}>{compareAtLabel}</span>
        </>
      ) : null}
    </span>
  );
}
