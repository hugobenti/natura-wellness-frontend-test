import { describe, expect, it } from "vitest";
import { setDraftQuantity, startDraft, toggleDraftSkip } from "./editDraft";
import { EMPTY_OVERLAY } from "./subscriptionView";

const skus = ["NW-VITD-60", "NW-MULTI-30"] as const;

describe("edit drafts", () => {
  it("starts with independent quantities and skipped items from the committed overlay", () => {
    const overlay = {
      ...EMPTY_OVERLAY,
      quantities: { "NW-VITD-60": 2 },
      skippedSkus: ["NW-MULTI-30"],
    };
    const draft = startDraft(overlay);
    expect(draft).toEqual({
      quantities: { "NW-VITD-60": 2 },
      skippedSkus: ["NW-MULTI-30"],
      zeroSkus: [],
    });
    expect(draft.quantities).not.toBe(overlay.quantities);
    expect(draft.skippedSkus).not.toBe(overlay.skippedSkus);
  });

  it("setDraftQuantity clamps to 10 at most", () => {
    const draft = startDraft(EMPTY_OVERLAY);
    expect(setDraftQuantity(draft, skus[0], 11).quantities[skus[0]]).toBe(10);
    expect(draft.quantities).toEqual({});
  });

  it("quantity 0 skips the product for the next box and keeps its future quantity", () => {
    const draft = startDraft({ ...EMPTY_OVERLAY, quantities: { [skus[0]]: 3 } });
    const zeroed = setDraftQuantity(draft, skus[0], 0);
    expect(zeroed.skippedSkus).toEqual([skus[0]]);
    expect(zeroed.zeroSkus).toEqual([skus[0]]);
    expect(zeroed.quantities[skus[0]]).toBe(3);
    const back = setDraftQuantity(zeroed, skus[0], 1);
    expect(back.skippedSkus).toEqual([]);
    expect(back.zeroSkus).toEqual([]);
    expect(back.quantities[skus[0]]).toBe(1);
  });

  it("toggleDraftSkip skips then unskips", () => {
    const draft = startDraft(EMPTY_OVERLAY);
    const skipped = toggleDraftSkip(draft, skus[0]);
    const restored = toggleDraftSkip(skipped, skus[0]);
    expect(skipped.skippedSkus).toEqual([skus[0]]);
    expect(restored.skippedSkus).toEqual([]);
    expect(draft.skippedSkus).toEqual([]);
  });

  it("the last product can be skipped", () => {
    const first = toggleDraftSkip(startDraft(EMPTY_OVERLAY), skus[0]);
    const second = toggleDraftSkip(first, skus[1]);
    expect(second.skippedSkus).toEqual([skus[0], skus[1]]);
  });
});
