import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useEffect, useReducer, useRef, useState } from "react";
import { useSubscription } from "./hooks/useSubscription";
import { useEditMode } from "./hooks/useEditMode";
import type { INotice } from "./hooks/notice.type";
import { useCancelFlow } from "./hooks/useCancelFlow";
import { usePauseFlow } from "./hooks/usePauseFlow";
import { useSkipFlow } from "./hooks/useSkipFlow";
import { addDays, formatDay } from "./logic/dates";
import { overlayReducer } from "./logic/overlay";
import { deriveReceiptPresentation } from "./logic/receiptPresentation";
import { deriveView, EMPTY_OVERLAY } from "./logic/subscriptionView";
import type { IManageAction, TPageModel } from "./SubscriptionCard.type";
import type {
  IReceiptCardProps,
  IReceiptLineModel,
  TReceiptFooter,
} from "./components/ReceiptCard/ReceiptCard.type";
import type { ISkipSheetProps } from "./components/SkipSheet/SkipSheet.type";
import { skipSheet as skipSheetStyles } from "./components/SkipSheet/SkipSheet.style";

export function useSubscriptionCard(): TPageModel {
  const { state, retry, reload, replace } = useSubscription();
  const [overlay, dispatch] = useReducer(overlayReducer, EMPTY_OVERLAY);
  const [notice, setNotice] = useState<INotice | null>(null);
  const snapshot = state.status === "ready" ? state.snapshot : null;
  const comparisonOverlay = { ...overlay, skippedSkus: [], zeroSkus: [] };
  const view = snapshot ? deriveView(snapshot, overlay) : null;
  const clearNotice = () => setNotice(null);
  const edit = useEditMode({ overlay, snapshot, dispatch, notify: setNotice });
  const startEdit = () => {
    clearNotice();
    edit.start();
  };
  const pauseFlow = usePauseFlow({
    view,
    overlay,
    dispatch,
    notify: setNotice,
  });
  const skipFlow = useSkipFlow({
    view,
    comparisonView: snapshot ? deriveView(snapshot, comparisonOverlay) : null,
    reload: async () => {
      const fresh = await reload();
      if (fresh && fresh.nextChargeAt !== view!.nextChargeAt) dispatch({ type: "clearSkipped" });
      return fresh;
    },
    deriveFresh: (fresh) => deriveView(fresh, comparisonOverlay),
    onSkipped: (fresh) => {
      replace(fresh);
      dispatch({ type: "clearSkipped" });
    },
    skipLocally: () =>
      dispatch({
        type: "skipLocally",
        nextChargeAt: view!.nextChargeAt!,
        intervalDays: view!.intervalDays,
      }),
    localSuccessAmount: () =>
      deriveView(snapshot!, { ...overlay, skippedSkus: [] }).pricing.totalCents,
    successAmount: (fresh) =>
      deriveView(fresh, overlayReducer(overlay, { type: "clearSkipped" })).pricing.totalCents,
    notify: setNotice,
  });
  const offerHandoff = useRef<"skip" | "pause" | null>(null);
  const cancelFlow = useCancelFlow({
    subscription: view,
    dispatch,
    notify: setNotice,
    clearNotice,
    openSkip: () => {
      offerHandoff.current = "skip";
      skipFlow.open();
    },
    openPause: () => {
      offerHandoff.current = "pause";
      pauseFlow.openPause();
    },
  });
  const { h1Ref } = cancelFlow;
  useEffect(() => {
    if (offerHandoff.current === "skip" && skipFlow.phase !== null) return;
    if (offerHandoff.current === "pause" && pauseFlow.sheet.open) return;
    if (offerHandoff.current === null) return;
    offerHandoff.current = null;
    queueMicrotask(() => h1Ref.current?.focus());
  }, [skipFlow.phase, pauseFlow.sheet.open, h1Ref]);
  const shownStatus = useRef<string | null>(null);
  const status = view?.status ?? null;
  useEffect(() => {
    if (status === null) return;
    const previous = shownStatus.current;
    shownStatus.current = status;
    if (previous !== null && previous !== status) edit.headingRef.current?.focus();
  }, [status, edit.headingRef]);
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
            formatMoney(readyView.pricing.totalCents),
            formatDay(readyView.pausedUntil, now),
          )
        : copy.pausedOpenNext,
    };
  } else {
    heading = copy.headingCancelled(formatDay(readyView.cancelledAt!, now));
    footer = { kind: "note", label: copy.cancelledTotal, sublabel: null };
  }

  const presentation = deriveReceiptPresentation(displayed);
  const lines: IReceiptLineModel[] = presentation.lines.map(
    ({ sku, name, imageUrl, quantity, skipped, priceCents, compareAtCents, mutedPrice }) => {
      const zero = edit.editing && edit.isZero(sku);
      return {
        sku,
        name,
        imageUrl,
        quantityLabel: copy.quantity(quantity),
        priceCents,
        compareAtCents,
        mutedPrice,
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
    groupLabel: presentation.groupLabel,
    footer,
    headingRef: edit.headingRef,
  };
  const cancelAction: IManageAction = {
    key: "cancel",
    label: subscriptionContent.manage.cancel,
    variant: "quiet",
    onClick: cancelFlow.open,
  };
  const actions: IManageAction[] = edit.editing
    ? [
        {
          key: "save",
          label: subscriptionContent.manage.save,
          variant: "primary",
          disabled: edit.emptyBox,
          onClick: () => {
            if (edit.save()) {
              clearNotice();
              skipFlow.open();
            }
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
            onClick: startEdit,
            ref: edit.editButtonRef,
          },
          {
            key: "skip",
            label: subscriptionContent.manage.skip,
            variant: "secondary",
            onClick: () => {
              clearNotice();
              skipFlow.open();
            },
          },
          {
            key: "pause",
            label: subscriptionContent.manage.pause,
            variant: "secondary",
            onClick: () => {
              clearNotice();
              pauseFlow.openPause();
            },
          },
          cancelAction,
        ]
      : readyView.status === "paused"
        ? [
            {
              key: "resume",
              label: subscriptionContent.manage.resume,
              variant: "primary",
              onClick: pauseFlow.resume,
            },
            {
              key: "changePause",
              label: subscriptionContent.manage.changePause,
              variant: "secondary",
              onClick: () => {
                clearNotice();
                pauseFlow.openChange();
              },
            },
            cancelAction,
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
      conflict: skipFlow.conflict,
      changeItems:
        skipFlow.conflict?.messages.map((message, index) => ({
          key: `${index}-${message}`,
          message,
        })) ?? [],
      factStyles: {
        nextBoxLabel: skipFlow.conflict?.nextDateChanged
          ? skipSheetStyles.changedLabel
          : skipSheetStyles.factLabel,
        oldDate: skipSheetStyles.oldDate,
        newDate: skipFlow.conflict?.skipDateChanged
          ? skipSheetStyles.changedValue
          : skipSheetStyles.newDate,
        chargeLabel: skipFlow.conflict?.skipDateChanged
          ? skipSheetStyles.changedLabel
          : skipSheetStyles.factLabel,
        amount: skipFlow.conflict?.totalChanged
          ? skipSheetStyles.changedValue
          : skipSheetStyles.factValue,
      },
      oldDate,
      newDate,
      amount: formatMoney(deriveView(state.snapshot, comparisonOverlay).pricing.totalCents),
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
    pageView: cancelFlow.view,
    confirm: cancelFlow.confirm,
    editHint:
      edit.editing && edit.emptyBox
        ? {
            text: editCopy.stopAllHint,
            cancelLabel: subscriptionContent.manage.cancel,
            onCancel: () => {
              edit.cancel();
              cancelFlow.open();
            },
          }
        : null,
    receipt,
    notice,
    dismissNotice: () => {
      clearNotice();
      edit.headingRef.current?.focus();
    },
    skipSheet,
    pauseSheet: pauseFlow.sheet,
    actions,
  };
}
