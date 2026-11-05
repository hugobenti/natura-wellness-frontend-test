import { describe, expect, it } from "vitest";
import { overlayReducer } from "./overlay";
import { EMPTY_OVERLAY } from "./subscriptionView";

describe("overlayReducer", () => {
  it("saveEdits replaces quantities and skippedSkus without replacing the lifecycle", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: { status: "paused" as const, pausedUntil: null },
    };
    const draft = { quantities: { "NW-MULTI-30": 3 }, skippedSkus: ["NW-VITD-60"] };
    const updated = overlayReducer(paused, { type: "saveEdits", draft });
    expect(updated).toEqual({ ...paused, ...draft });
    expect(updated.quantities).not.toBe(draft.quantities);
    expect(updated.skippedSkus).not.toBe(draft.skippedSkus);
  });

  it("clearSkipped keeps quantities after the whole box moves", () => {
    const committed = {
      ...EMPTY_OVERLAY,
      quantities: { "NW-MULTI-30": 3 },
      skippedSkus: ["NW-VITD-60"],
    };
    const updated = overlayReducer(committed, { type: "clearSkipped" });
    expect(updated.quantities).toEqual({ "NW-MULTI-30": 3 });
    expect(updated.skippedSkus).toEqual([]);
    expect(committed.skippedSkus).toEqual(["NW-VITD-60"]);
  });

  it("reducer returns a new object", () => {
    expect(overlayReducer(EMPTY_OVERLAY, { type: "clearSkipped" })).not.toBe(EMPTY_OVERLAY);
  });
});
