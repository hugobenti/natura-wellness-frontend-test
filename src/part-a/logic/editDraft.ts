import { clampQuantity } from "@/shared/logic/quantity";
import type { IEditDraft } from "./editDraft.type";
import type { ILocalOverlay } from "./subscriptionView.type";

export const MAX_QUANTITY = 10;

export function startDraft(overlay: ILocalOverlay): IEditDraft {
  return {
    quantities: { ...overlay.quantities },
    skippedSkus: [...overlay.skippedSkus],
    zeroSkus: overlay.zeroSkus.filter((sku) => overlay.skippedSkus.includes(sku)),
  };
}

/** 0 skips the product for the next box only; its quantity for later boxes is left as it was. */
export function setDraftQuantity(draft: IEditDraft, sku: string, quantity: number): IEditDraft {
  const clamped = clampQuantity(quantity, 0, MAX_QUANTITY);
  if (clamped === 0) {
    return {
      ...draft,
      skippedSkus: draft.skippedSkus.includes(sku)
        ? draft.skippedSkus
        : [...draft.skippedSkus, sku],
      zeroSkus: draft.zeroSkus.includes(sku) ? draft.zeroSkus : [...draft.zeroSkus, sku],
    };
  }
  const wasZero = draft.zeroSkus.includes(sku);
  return {
    ...draft,
    quantities: { ...draft.quantities, [sku]: clamped },
    skippedSkus: wasZero
      ? draft.skippedSkus.filter((skipped) => skipped !== sku)
      : draft.skippedSkus,
    zeroSkus: wasZero ? draft.zeroSkus.filter((zeroed) => zeroed !== sku) : draft.zeroSkus,
  };
}

export function toggleDraftSkip(draft: IEditDraft, sku: string): IEditDraft {
  if (draft.skippedSkus.includes(sku)) {
    return {
      ...draft,
      skippedSkus: draft.skippedSkus.filter((skipped) => skipped !== sku),
      zeroSkus: draft.zeroSkus.filter((zeroed) => zeroed !== sku),
    };
  }
  return { ...draft, skippedSkus: [...draft.skippedSkus, sku] };
}
