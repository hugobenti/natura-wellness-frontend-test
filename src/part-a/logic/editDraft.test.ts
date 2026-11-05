import { describe, expect, it } from "vitest";
import { canSkip, setDraftQuantity, startDraft, toggleDraftSkip } from "./editDraft";
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
    expect(draft).toEqual({ quantities: { "NW-VITD-60": 2 }, skippedSkus: ["NW-MULTI-30"] });
    expect(draft.quantities).not.toBe(overlay.quantities);
    expect(draft.skippedSkus).not.toBe(overlay.skippedSkus);
  });

  it("setDraftQuantity clamps to 1..10", () => {
    const draft = startDraft(EMPTY_OVERLAY);
    expect(setDraftQuantity(draft, skus[0], 0).quantities[skus[0]]).toBe(1);
    expect(setDraftQuantity(draft, skus[0], 11).quantities[skus[0]]).toBe(10);
    expect(draft.quantities).toEqual({});
  });

  it("toggleDraftSkip skips then unskips", () => {
    const draft = startDraft(EMPTY_OVERLAY);
    const skipped = toggleDraftSkip(draft, skus[0], skus);
    const restored = toggleDraftSkip(skipped, skus[0], skus);
    expect(skipped.skippedSkus).toEqual([skus[0]]);
    expect(restored.skippedSkus).toEqual([]);
    expect(draft.skippedSkus).toEqual([]);
  });

  it("the last unskipped product cannot be skipped", () => {
    const first = toggleDraftSkip(startDraft(EMPTY_OVERLAY), skus[0], skus);
    const attempted = toggleDraftSkip(first, skus[1], skus);
    expect(attempted.skippedSkus).toEqual([skus[0]]);
    expect(canSkip(first, skus[1], skus)).toBe(false);
    expect(canSkip(first, skus[0], skus)).toBe(true);
  });
});
