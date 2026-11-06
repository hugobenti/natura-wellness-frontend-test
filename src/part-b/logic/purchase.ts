import { formatMoney } from "@/shared/logic/money";
import type { TBuyBoxCopy } from "./purchase.type";

/**
 * The provided fine print with the picked frequency and charge. The provided sentence is written for
 * the default frequency at the default price, so those two values are what get replaced.
 */
export function renewalNote(source: TBuyBoxCopy, frequency: string, chargeCents: number): string {
  const [defaultFrequency = ""] = source.subscribe.frequencyOptions;
  return source.finePrint
    .replace(defaultFrequency, frequency)
    .replace(formatMoney(source.subscribe.priceCents), formatMoney(chargeCents));
}
