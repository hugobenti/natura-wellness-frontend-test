import { formatMoney } from "@/shared/logic/money";
import { useState, type ChangeEvent } from "react";
import { copy } from "./copy";
import { renewalNote } from "./logic/purchase";
import type { TPurchaseOption } from "./logic/purchase.type";

/** What the customer picked (purchase option, frequency, quantity) and everything derived from it. */
export function useBuyBox() {
  const [option, setOption] = useState<TPurchaseOption>("subscribe");
  const [frequency, setFrequency] = useState(copy.subscribe.frequencyOptions[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  const subscribed = option === "subscribe";
  const unitCents = subscribed ? copy.subscribe.priceCents : copy.oneTime.priceCents;
  const totalCents = unitCents * quantity;

  return {
    option,
    selectOption: setOption,
    frequency,
    onFrequencyChange: (event: ChangeEvent<HTMLSelectElement>) => setFrequency(event.target.value),
    quantity,
    setQuantity,
    /** The charge for the picked option and quantity, shown on the add to cart button. */
    addToCartPrice: formatMoney(totalCents),
    renewal: subscribed ? renewalNote(copy, frequency, totalCents) : null,
  };
}
