import { clampQuantity } from "@/shared/logic/quantity";
import type { IEditDraft } from "./editDraft.type";
import type { ILocalOverlay } from "./subscriptionView.type";

export const MAX_QUANTITY = 10;

export function startDraft(overlay: ILocalOverlay): IEditDraft {
  return { quantities: { ...overlay.quantities }, skippedSkus: [...overlay.skippedSkus] };
}

export function setDraftQuantity(draft: IEditDraft, sku: string, quantity: number): IEditDraft {
  return {
    ...draft,
    quantities: { ...draft.quantities, [sku]: clampQuantity(quantity, 1, MAX_QUANTITY) },
  };
}

export function canSkip(draft: IEditDraft, sku: string, allSkus: readonly string[]): boolean {
  return (
    draft.skippedSkus.includes(sku) ||
    allSkus.some((other) => other !== sku && !draft.skippedSkus.includes(other))
  );
}

export function toggleDraftSkip(
  draft: IEditDraft,
  sku: string,
  allSkus: readonly string[],
): IEditDraft {
  if (draft.skippedSkus.includes(sku)) {
    return { ...draft, skippedSkus: draft.skippedSkus.filter((skipped) => skipped !== sku) };
  }
  if (!canSkip(draft, sku, allSkus)) return draft;
  return { ...draft, skippedSkus: [...draft.skippedSkus, sku] };
}
