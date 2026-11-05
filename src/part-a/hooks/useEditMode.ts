import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useEffect, useRef, useState } from "react";
import { formatDay } from "../logic/dates";
import {
  canSkip as canSkipDraft,
  setDraftQuantity,
  startDraft,
  toggleDraftSkip,
} from "../logic/editDraft";
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
    if (!snapshot) return;
    const allSkus = snapshot.items.map((item) => item.sku);
    setDraft((current) => current && toggleDraftSkip(current, sku, allSkus));
  };
  const canSkip = (sku: string) =>
    draft !== null &&
    snapshot !== null &&
    canSkipDraft(
      draft,
      sku,
      snapshot.items.map((item) => item.sku),
    );
  const save = () => {
    if (!draft || !draftView || !draftView.nextChargeAt) return;
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
    canSkip,
    headingRef,
    editButtonRef,
  };
}
