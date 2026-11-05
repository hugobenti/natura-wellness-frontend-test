import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useState } from "react";
import { formatDay } from "../logic/dates";
import { PAUSE_PRESETS, pauseUntil, resumeChargeAt } from "../logic/pause";
import type { TPausePresetId } from "../logic/pause.type";
import type { IUsePauseFlowArgs, IUsePauseFlowResult } from "./usePauseFlow.type";

export function usePauseFlow({
  view,
  overlay,
  dispatch,
  notify,
}: IUsePauseFlowArgs): IUsePauseFlowResult {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TPausePresetId | "">("");
  const copy = subscriptionContent.pause;
  const now = new Date();
  const paused = view?.status === "paused";
  const options = PAUSE_PRESETS.map(({ id }) => {
    const until = pauseUntil(id, now);
    return {
      value: id,
      label: copy.options[id],
      description: until ? copy.nextCharge(formatDay(until, now)) : copy.openDescription,
    };
  });
  const openPause = () => {
    if (view?.status !== "active") return;
    setSelected("1m");
    setOpen(true);
  };
  const openChange = () => {
    if (!paused) return;
    setSelected(overlay.lifecycle?.status === "paused" ? (overlay.lifecycle.presetId ?? "") : "");
    setOpen(true);
  };
  const onConfirm = () => {
    if (!selected || !view || (view.status !== "active" && view.status !== "paused")) return;
    const confirmedAt = new Date();
    const until = pauseUntil(selected, confirmedAt);
    const resumeAt =
      view.status === "active"
        ? view.nextChargeAt
        : overlay.lifecycle?.status === "paused"
          ? overlay.lifecycle.resumeAt
          : null;
    dispatch({ type: "pause", presetId: selected, now: confirmedAt, resumeAt });
    setOpen(false);
    notify({
      tone: "success",
      title: copy.pausedTitle,
      body: until ? copy.pausedBody(formatDay(until, confirmedAt)) : copy.pausedBodyOpen,
    });
  };
  const resume = () => {
    if (!paused || !view) return;
    const resumedAt = new Date();
    const resumeAt = overlay.lifecycle?.status === "paused" ? overlay.lifecycle.resumeAt : null;
    dispatch({ type: "resume", now: resumedAt });
    notify({
      tone: "success",
      title: copy.resumedTitle,
      body: copy.resumedBody(
        formatMoney(view.pricing.totalCents),
        formatDay(resumeChargeAt(resumedAt, resumeAt), resumedAt),
      ),
    });
  };
  const confirmLabel = selected
    ? selected === "open"
      ? copy.confirmOpen
      : copy.confirm(copy.options[selected])
    : copy.chooseDuration;
  const intro = paused
    ? view.pausedUntil
      ? copy.changeIntro(formatDay(view.pausedUntil, now))
      : copy.changeIntroOpen
    : copy.intro;
  const keepLabel = paused
    ? view.pausedUntil
      ? copy.keepDate(formatDay(view.pausedUntil, now))
      : copy.keepOpen
    : copy.keepActive;

  return {
    sheet: {
      open,
      title: paused ? copy.changeTitle : copy.title,
      intro,
      value: selected,
      options,
      onChange: setSelected,
      confirmLabel,
      confirmDisabled: !selected,
      onConfirm,
      keepLabel,
      onClose: () => setOpen(false),
    },
    openPause,
    openChange,
    resume,
  };
}
