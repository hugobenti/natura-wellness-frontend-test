import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useRef, useState } from "react";
import { useSubscription } from "./hooks/useSubscription";
import type { INotice } from "./hooks/notice.type";
import { useSkipFlow } from "./hooks/useSkipFlow";
import { addDays, formatDay } from "./logic/dates";
import { deriveView, EMPTY_OVERLAY } from "./logic/subscriptionView";
import type { IManageAction, TPageModel } from "./SubscriptionCard.type";
import type {
  IReceiptCardProps,
  IReceiptLineModel,
  TReceiptFooter,
} from "./components/ReceiptCard/ReceiptCard.type";
import type { ISkipSheetProps } from "./components/SkipSheet/SkipSheet.type";

export function useSubscriptionCard(): TPageModel {
  const { state, retry, reload, replace } = useSubscription();
  const [notice, setNotice] = useState<INotice | null>(null);
  const view = state.status === "ready" ? deriveView(state.snapshot, EMPTY_OVERLAY) : null;
  const skipFlow = useSkipFlow({ view, reload, onSkipped: replace, notify: setNotice });
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
  const readyView = view!;
  const now = new Date();
  const copy = subscriptionContent.receipt;
  let heading: string;
  let footer: TReceiptFooter;

  if (readyView.status === "active") {
    heading = copy.headingActive;
    footer = {
      kind: "charge",
      label: copy.charged(formatDay(readyView.nextChargeAt!, now)),
      sublabel: copy.every(readyView.intervalDays),
      totalCents: readyView.pricing.totalCents,
      compareAtCents: readyView.pricing.subtotalCents,
      savingLabel: copy.saving(formatMoney(readyView.pricing.savingCents)),
    };
  } else if (readyView.status === "paused") {
    heading = readyView.pausedUntil
      ? copy.headingPaused(formatDay(readyView.pausedUntil, now))
      : copy.headingPausedOpen;
    footer = {
      kind: "note",
      label: copy.pausedTotal,
      sublabel: readyView.pausedUntil
        ? copy.pausedNext(
            formatDay(readyView.pausedUntil, now),
            formatMoney(readyView.pricing.totalCents),
          )
        : copy.pausedOpenNext,
    };
  } else {
    heading = copy.headingCancelled(formatDay(readyView.cancelledAt!, now));
    footer = { kind: "note", label: copy.cancelledTotal, sublabel: null };
  }

  const lines: IReceiptLineModel[] = readyView.lines.map(
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
    status: readyView.status,
    lines,
    footer,
  };
  const actions: IManageAction[] =
    readyView.status === "active"
      ? [
          {
            key: "skip",
            label: subscriptionContent.manage.skip,
            variant: "secondary",
            onClick: skipFlow.open,
          },
        ]
      : [];
  let skipSheet: ISkipSheetProps | null = null;
  if (readyView.status === "active" && readyView.nextChargeAt) {
    const oldDate = formatDay(readyView.nextChargeAt, now);
    const newDate = formatDay(addDays(readyView.nextChargeAt, readyView.intervalDays), now);
    const phase = skipFlow.phase ?? "confirm";
    const skipCopy = subscriptionContent.skip;
    skipSheet = {
      open: skipFlow.phase !== null,
      phase,
      oldDate,
      newDate,
      amount: formatMoney(
        deriveView(state.snapshot, { ...EMPTY_OVERLAY, skippedSkus: [] }).pricing.totalCents,
      ),
      confirmLabel:
        phase === "pending"
          ? skipCopy.pending
          : phase === "error"
            ? skipCopy.retry
            : skipCopy.confirm,
      chargeLabel: skipCopy.chargedOn(newDate),
      nothingNote: skipCopy.nothingOn(oldDate),
      errorBody: skipCopy.errorBody(oldDate),
      onConfirm: skipFlow.confirm,
      onClose: skipFlow.close,
    };
  }
  return { h1Ref, kind: "ready", receipt, notice, skipSheet, actions };
}
