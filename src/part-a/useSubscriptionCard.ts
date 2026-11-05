import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useRef } from "react";
import { useSubscription } from "./hooks/useSubscription";
import { formatDay } from "./logic/dates";
import { deriveView, EMPTY_OVERLAY } from "./logic/subscriptionView";
import type { TPageModel } from "./SubscriptionCard.type";
import type {
  IReceiptCardProps,
  IReceiptLineModel,
  TReceiptFooter,
} from "./components/ReceiptCard/ReceiptCard.type";

export function useSubscriptionCard(): TPageModel {
  const { state, retry } = useSubscription();
  const h1Ref = useRef<HTMLHeadingElement>(null);
  if (state.status === "loading") return { h1Ref, kind: "loading" };
  if (state.status === "error") {
    return {
      h1Ref,
      kind: "error",
      onRetry: () => {
        h1Ref.current?.focus();
        retry();
      },
    };
  }

  const view = deriveView(state.snapshot, EMPTY_OVERLAY);
  const now = new Date();
  const copy = subscriptionContent.receipt;
  let heading: string;
  let footer: TReceiptFooter;

  if (view.status === "active") {
    heading = copy.headingActive;
    footer = {
      kind: "charge",
      label: copy.charged(formatDay(view.nextChargeAt!, now)),
      sublabel: copy.every(view.intervalDays),
      totalCents: view.pricing.totalCents,
      compareAtCents: view.pricing.subtotalCents,
      savingLabel: copy.saving(formatMoney(view.pricing.savingCents)),
    };
  } else if (view.status === "paused") {
    heading = view.pausedUntil
      ? copy.headingPaused(formatDay(view.pausedUntil, now))
      : copy.headingPausedOpen;
    footer = {
      kind: "note",
      label: copy.pausedTotal,
      sublabel: view.pausedUntil
        ? copy.pausedNext(formatDay(view.pausedUntil, now), formatMoney(view.pricing.totalCents))
        : copy.pausedOpenNext,
    };
  } else {
    heading = copy.headingCancelled(formatDay(view.cancelledAt!, now));
    footer = { kind: "note", label: copy.cancelledTotal, sublabel: null };
  }

  const lines: IReceiptLineModel[] = view.lines.map(
    ({ sku, name, imageUrl, quantity, priceCents, compareAtCents }) => ({
      sku,
      name,
      imageUrl,
      quantityLabel: copy.quantity(quantity),
      priceCents,
      compareAtCents,
    }),
  );
  const receipt: IReceiptCardProps = {
    heading,
    status: view.status,
    lines,
    footer,
  };
  return { h1Ref, kind: "ready", receipt };
}
