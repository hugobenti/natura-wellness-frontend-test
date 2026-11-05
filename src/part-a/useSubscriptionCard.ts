import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useReducer, useRef, useState } from "react";
import { useSubscription } from "./hooks/useSubscription";
import { useEditMode } from "./hooks/useEditMode";
import type { INotice } from "./hooks/notice.type";
import { useSkipFlow } from "./hooks/useSkipFlow";
import { addDays, formatDay } from "./logic/dates";
import { overlayReducer } from "./logic/overlay";
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
  const [overlay, dispatch] = useReducer(overlayReducer, EMPTY_OVERLAY);
  const [notice, setNotice] = useState<INotice | null>(null);
  const snapshot = state.status === "ready" ? state.snapshot : null;
  const view = snapshot ? deriveView(snapshot, overlay) : null;
  const edit = useEditMode({ overlay, snapshot, dispatch, notify: setNotice });
  const skipFlow = useSkipFlow({
    view,
    reload: async () => {
      const fresh = await reload();
      if (fresh && fresh.nextChargeAt !== view!.nextChargeAt) dispatch({ type: "clearSkipped" });
      return fresh;
    },
    onSkipped: (fresh) => {
      replace(fresh);
      dispatch({ type: "clearSkipped" });
    },
    successAmount: (fresh) =>
      deriveView(fresh, overlayReducer(overlay, { type: "clearSkipped" })).pricing.totalCents,
    notify: setNotice,
  });
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
  const displayed = edit.draftView ?? readyView;
  const now = new Date();
  const copy = subscriptionContent.receipt;
  const editCopy = subscriptionContent.edit;
  let heading: string;
  let footer: TReceiptFooter;

  if (edit.editing) {
    heading = editCopy.heading;
    footer = {
      kind: "draft",
      label: editCopy.newTotal,
      sublabel: editCopy.currently(formatMoney(readyView.pricing.totalCents)),
      totalCents: displayed.pricing.totalCents,
      compareAtCents: displayed.pricing.subtotalCents,
      savingLabel:
        displayed.pricing.savingCents > 0
          ? copy.saving(formatMoney(displayed.pricing.savingCents))
          : null,
    };
  } else if (readyView.status === "active") {
    heading = copy.headingActive;
    footer = {
      kind: "charge",
      label: copy.charged(formatDay(readyView.nextChargeAt!, now)),
      sublabel: copy.every(readyView.intervalDays),
      totalCents: readyView.pricing.totalCents,
      compareAtCents: readyView.pricing.subtotalCents,
      savingLabel:
        readyView.pricing.savingCents > 0
          ? copy.saving(formatMoney(readyView.pricing.savingCents))
          : null,
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

  const lines: IReceiptLineModel[] = displayed.lines.map(
    ({ sku, name, imageUrl, quantity, skipped, priceCents, compareAtCents }) => {
      const zero = edit.editing && edit.isZero(sku);
      return {
        sku,
        name,
        imageUrl,
        quantityLabel: copy.quantity(quantity),
        priceCents,
        compareAtCents,
        skippedNote: skipped && !zero ? editCopy.skippedNote : null,
        edit: edit.editing
          ? {
              quantity: zero ? 0 : quantity,
              onQuantityChange: (value: number) => edit.setQuantity(sku, value),
              stepperLabel: editCopy.stepperLabel(name),
              skip: !skipped
                ? { label: editCopy.skipOnceLabel(name), onClick: () => edit.toggleSkip(sku) }
                : null,
              undo:
                skipped && !zero
                  ? { label: editCopy.undoLabel(name), onClick: () => edit.toggleSkip(sku) }
                  : null,
              skippedNote: skipped && !zero ? editCopy.skippedNote : null,
              zeroNote: zero ? editCopy.notInNextBox : null,
            }
          : undefined,
      };
    },
  );
  const receipt: IReceiptCardProps = {
    heading,
    status: displayed.status,
    lines,
    footer,
    headingRef: edit.headingRef,
  };
  const actions: IManageAction[] = edit.editing
    ? [
        {
          key: "save",
          label: subscriptionContent.manage.save,
          variant: "primary",
          disabled: edit.emptyBox,
          onClick: () => {
            if (edit.save()) skipFlow.open();
          },
        },
        {
          key: "cancelEdit",
          label: subscriptionContent.manage.cancelEdit,
          variant: "secondary",
          onClick: edit.cancel,
        },
      ]
    : readyView.status === "active"
      ? [
          {
            key: "edit",
            label: subscriptionContent.manage.edit,
            variant: "secondary",
            onClick: edit.start,
            ref: edit.editButtonRef,
          },
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
        deriveView(state.snapshot, { ...overlay, skippedSkus: [], zeroSkus: [] }).pricing
          .totalCents,
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
  return {
    h1Ref,
    kind: "ready",
    editHint: edit.editing && edit.emptyBox ? { text: editCopy.stopAllHint } : null,
    receipt,
    notice,
    skipSheet,
    actions,
  };
}
