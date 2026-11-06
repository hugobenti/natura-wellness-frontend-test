import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useEffect, useRef, useState } from "react";
import { formatDay } from "../logic/dates";
import { setDraftQuantity, startDraft, toggleDraftSkip } from "../logic/editDraft";
import type { IEditDraft } from "../logic/editDraft.type";
import { deriveView } from "../logic/subscriptionView";
import type { IUseEditModeArgs, IUseEditModeResult } from "./useEditMode.type";

export function useEditMode({
  overlay,
  snapshot,
  dispatch,
  notify,
}: IUseEditModeArgs): IUseEditModeResult {
  const [draft, setDraft] = useState<IEditDraft | null>(null);
  const editing = draft !== null;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyEditing = useRef(false);
  const draftView = draft && snapshot ? deriveView(snapshot, { ...overlay, ...draft }) : null;

  useEffect(() => {
    if (previouslyEditing.current === editing) return;
    previouslyEditing.current = editing;
    if (editing) headingRef.current?.focus();
    else editButtonRef.current?.focus();
  }, [editing]);

  const start = () => {
    if (snapshot) setDraft(startDraft(overlay));
  };
  const setQuantity = (sku: string, quantity: number) => {
    setDraft((current) => current && setDraftQuantity(current, sku, quantity));
  };
  const toggleSkip = (sku: string) => {
    setDraft((current) => current && toggleDraftSkip(current, sku));
  };
  const setFrequency = (value: string) => {
    const days = Number(value);
    setDraft(
      (current) =>
        current && { ...current, intervalDays: days === snapshot?.intervalDays ? null : days },
    );
  };
  const isZero = (sku: string) => draft?.zeroSkus.includes(sku) ?? false;
  const allExcluded = draftView !== null && draftView.lines.every(({ skipped }) => skipped);
  /** Every product is out of the box and at least one was stepped to 0: nothing to save. */
  const emptyBox = allExcluded && draft !== null && draft.zeroSkus.length > 0;
  /** Returns true when every product is excluded: the caller then offers the whole-box skip. */
  const save = (): boolean => {
    if (!draft || !draftView || !draftView.nextChargeAt || emptyBox) return false;
    if (allExcluded) {
      dispatch({ type: "saveEdits", draft: { ...draft, skippedSkus: [...overlay.skippedSkus] } });
      setDraft(null);
      return true;
    }
    dispatch({ type: "saveEdits", draft });
    setDraft(null);
    notify({
      tone: "success",
      title: subscriptionContent.edit.savedTitle,
      body: subscriptionContent.edit.savedBody(
        formatMoney(draftView.pricing.totalCents),
        formatDay(draftView.nextChargeAt, new Date()),
      ),
    });
    return false;
  };
  const cancel = () => setDraft(null);

  return {
    editing,
    draftView,
    start,
    save,
    cancel,
    setQuantity,
    toggleSkip,
    frequencyValue: String(draft?.intervalDays ?? snapshot?.intervalDays ?? 30),
    setFrequency,
    isZero,
    emptyBox,
    allExcluded,
    headingRef,
    editButtonRef,
  };
}
