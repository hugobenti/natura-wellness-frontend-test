import { describe, expect, it } from "vitest";
import { overlayReducer } from "./overlay";
import { EMPTY_OVERLAY } from "./subscriptionView";

describe("overlayReducer", () => {
  it("saveEdits replaces quantities and skippedSkus without replacing the lifecycle", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: { status: "paused" as const, pausedUntil: null, presetId: null },
    };
    const draft = { quantities: { "NW-MULTI-30": 3 }, skippedSkus: ["NW-VITD-60"], zeroSkus: [] };
    const updated = overlayReducer(paused, { type: "saveEdits", draft });
    expect(updated).toEqual({
      ...paused,
      quantities: draft.quantities,
      skippedSkus: draft.skippedSkus,
    });
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

  it("pause sets a paused lifecycle and clears skippedSkus", () => {
    const committed = {
      ...EMPTY_OVERLAY,
      quantities: { "NW-MULTI-30": 3 },
      skippedSkus: ["NW-VITD-60"],
    };
    const paused = overlayReducer(committed, {
      type: "pause",
      presetId: "1m",
      now: new Date("2026-11-05T12:00:00.000Z"),
    });
    expect(paused).toEqual({
      quantities: committed.quantities,
      skippedSkus: [],
      zeroSkus: [],
      lifecycle: {
        status: "paused",
        presetId: "1m",
        pausedUntil: "2026-12-05T12:00:00.000Z",
      },
    });
    expect(committed.skippedSkus).toEqual(["NW-VITD-60"]);
  });

  it("resume sets an active lifecycle at resumeChargeAt", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: { status: "paused" as const, pausedUntil: null, presetId: "open" as const },
    };
    expect(
      overlayReducer(paused, {
        type: "resume",
        now: new Date("2026-11-05T12:00:00.000Z"),
        originalNextChargeAt: "2026-11-11T12:00:00.000Z",
      }),
    ).toMatchObject({
      lifecycle: { status: "active", nextChargeAt: "2026-11-11T12:00:00.000Z" },
    });
  });

  it("skipLocally moves the lifecycle date by intervalDays and clears skips", () => {
    const committed = {
      ...EMPTY_OVERLAY,
      quantities: { "NW-MULTI-30": 3 },
      skippedSkus: ["NW-VITD-60"],
      lifecycle: { status: "active" as const, nextChargeAt: "2026-11-06T12:00:00.000Z" },
    };
    expect(
      overlayReducer(committed, {
        type: "skipLocally",
        nextChargeAt: committed.lifecycle.nextChargeAt,
        intervalDays: 30,
      }),
    ).toEqual({
      quantities: committed.quantities,
      skippedSkus: [],
      zeroSkus: [],
      lifecycle: { status: "active", nextChargeAt: "2026-12-06T12:00:00.000Z" },
    });
    expect(committed.skippedSkus).toEqual(["NW-VITD-60"]);
  });
});
