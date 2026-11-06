export interface IOptionPriceProps {
  amountCents: number;
  /** Original price in cents; shown crossed out only when greater than `amountCents`. */
  compareAtCents?: number;
}
