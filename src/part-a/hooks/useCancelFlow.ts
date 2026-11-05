import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useEffect, useRef, useState } from "react";
import type { TCancelReason } from "../components/CancelSurvey/CancelSurvey.type";
import type { IUseCancelFlowArgs, IUseCancelFlowResult, TPageView } from "./useCancelFlow.type";

const REASONS = ["tooMuch", "cost", "otherProduct", "noResults", "other"] as const;

export function useCancelFlow({
  subscription,
  dispatch,
  notify,
  clearNotice,
  startEdit,
}: IUseCancelFlowArgs): IUseCancelFlowResult {
  const [view, setView] = useState<TPageView>("subscription");
  const [reason, setReason] = useState<TCancelReason | "">("");
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const shownView = useRef<TPageView>("subscription");
  const keepFocus = useRef(false);
  const copy = subscriptionContent.cancel;
  const surveyCopy = subscriptionContent.survey;

  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    window.scrollTo({ top: 0 });
    if (keepFocus.current) keepFocus.current = false;
    else h1Ref.current?.focus();
  }, [view]);

  const perBox = subscription?.pricing.savingCents ?? 0;
  const cancellable = subscription?.status === "active" || subscription?.status === "paused";
  const open = () => {
    if (!cancellable) return;
    clearNotice();
    setView("cancelConfirm");
  };
  const back = () => {
    clearNotice();
    setView("subscription");
  };
  const editNextBox = () => {
    keepFocus.current = true;
    clearNotice();
    setView("subscription");
    startEdit();
  };
  const confirmCancel = () => {
    if (!cancellable) return;
    clearNotice();
    dispatch({ type: "cancel", now: new Date() });
    setReason("");
    setView("survey");
  };
  const finishSurvey = (body: string) => {
    setView("subscription");
    notify({ tone: "success", title: surveyCopy.doneTitle, body });
  };

  return {
    view,
    open,
    back,
    editNextBox,
    confirmCancel,
    h1Ref,
    confirm: {
      reasons: [
        {
          title: copy.tooMuchTitle,
          body: subscription?.status === "paused" ? copy.tooMuchBodyPaused : copy.tooMuchBody,
        },
        {
          title: copy.costTitle,
          body: copy.costBody(
            subscription?.discountPercent ?? 0,
            formatMoney(perBox),
            formatMoney(perBox * 12),
          ),
        },
      ],
      editLink:
        subscription?.status === "active" ? { label: copy.editLink, onClick: editNextBox } : null,
      keepLabel: copy.keep,
      onKeep: back,
      cancelLabel: copy.confirm,
      onCancel: confirmCancel,
      backLabel: copy.back,
      onBack: back,
    },
    survey: {
      value: reason,
      options: REASONS.map((value) => ({ value, label: surveyCopy.reasons[value] })),
      onChange: setReason,
      sendDisabled: reason === "",
      onSend: () => finishSurvey(surveyCopy.doneBodySent),
      onSkip: () => finishSurvey(surveyCopy.doneBody),
    },
  };
}
