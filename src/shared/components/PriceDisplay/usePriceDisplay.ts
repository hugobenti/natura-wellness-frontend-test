import { priceDisplayContent } from "@/content/components/priceDisplay";
import { formatMoney } from "@/shared/logic/money";
import type { IUsePriceDisplayArgs } from "./PriceDisplay.type";

/** Formats the price and, when it is a real discount, the original price with its screen-reader label. */
export function usePriceDisplay({ amountCents, compareAtCents }: IUsePriceDisplayArgs) {
  const hasCompareAt = compareAtCents !== undefined && compareAtCents > amountCents;
  const compareAt = hasCompareAt ? formatMoney(compareAtCents) : null;

  return {
    price: formatMoney(amountCents),
    compareAt,
    compareAtLabel: compareAt ? `${priceDisplayContent.wasPrefix} ${compareAt}` : null,
  };
}
