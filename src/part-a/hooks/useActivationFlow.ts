import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useState } from "react";
import { formatDay } from "../logic/dates";
import { resumeChargeAt } from "../logic/pause";
import type { IUseActivationFlowArgs, IUseActivationFlowResult } from "./useActivationFlow.type";

export function useActivationFlow({
  view,
  overlay,
  dispatch,
  notify,
}: IUseActivationFlowArgs): IUseActivationFlowResult {
  const [open, setOpen] = useState(false);
  const cancelled = view?.status === "cancelled";
  const now = new Date();
  const resumeAt = overlay.lifecycle?.status === "paused" ? overlay.lifecycle.resumeAt : null;
  const nextChargeAt = resumeChargeAt(now, resumeAt);
  const copy = subscriptionContent.activation;

  const confirm = () => {
    if (view?.status !== "paused" && view?.status !== "cancelled") return;
    dispatch({ type: "resume", now });
    notify({
      tone: "success",
      title: cancelled ? copy.reactivatedTitle : copy.resumedTitle,
      body: copy.successBody(formatMoney(view.pricing.totalCents), formatDay(nextChargeAt, now)),
    });
    setOpen(false);
  };

  return {
    open: () => {
      if (view?.status === "paused" || view?.status === "cancelled") setOpen(true);
    },
    dialog: {
      open,
      title: cancelled ? copy.reactivateTitle : copy.resumeTitle,
      description: copy.description(
        formatMoney(view?.pricing.totalCents ?? 0),
        formatDay(nextChargeAt, now),
      ),
      confirmLabel: cancelled ? copy.reactivateConfirm : copy.resumeConfirm,
      keepLabel: cancelled ? copy.keepCancelled : copy.keepPaused,
      onConfirm: confirm,
      onClose: () => setOpen(false),
    },
  };
}
