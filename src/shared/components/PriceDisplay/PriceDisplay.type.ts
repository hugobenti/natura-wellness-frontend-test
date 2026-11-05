import type { priceDisplay } from "./PriceDisplay.style";

export interface IPriceDisplayProps {
  amountCents: number;
  /** Original price in cents. Shown crossed out only when greater than `amountCents`. */
  compareAtCents?: number;
  size?: keyof typeof priceDisplay.size;
  /** `stacked` puts the original price under the price, right-aligned. */
  layout?: keyof typeof priceDisplay.layout;
  className?: string;
}

export interface IUsePriceDisplayArgs {
  amountCents: number;
  compareAtCents?: number;
}
