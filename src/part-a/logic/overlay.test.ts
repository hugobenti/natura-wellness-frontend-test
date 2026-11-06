import { describe, expect, it } from "vitest";
import { overlayReducer } from "./overlay";
import { EMPTY_OVERLAY } from "./subscriptionView";

describe("overlayReducer", () => {
  it("saveEdits replaces quantities and skippedSkus without replacing the lifecycle", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: {
        status: "paused" as const,
        pausedUntil: null,
        presetId: null,
        resumeAt: null,
      },
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
      resumeAt: "2026-11-11T12:00:00.000Z",
    });
    expect(paused).toEqual({
      ...committed,
      skippedSkus: [],
      zeroSkus: [],
      lifecycle: {
        status: "paused",
        presetId: "1m",
        pausedUntil: "2026-12-11T12:00:00.000Z",
        resumeAt: "2026-11-11T12:00:00.000Z",
      },
    });
    expect(committed.skippedSkus).toEqual(["NW-VITD-60"]);
  });

  it("keeps the skipped charge through pause, change and resume", () => {
    const now = new Date("2026-11-05T12:00:00.000Z");
    const skipped = overlayReducer(EMPTY_OVERLAY, {
      type: "skipLocally",
      nextChargeAt: "2026-11-11T12:00:00.000Z",
      intervalDays: 30,
    });
    expect(skipped.lifecycle).toEqual({
      status: "active",
      nextChargeAt: "2026-12-11T12:00:00.000Z",
    });
    const paused = overlayReducer(skipped, {
      type: "pause",
      presetId: "2m",
      now,
      resumeAt: "2026-12-11T12:00:00.000Z",
    });
    expect(paused.lifecycle).toMatchObject({
      pausedUntil: "2027-02-09T12:00:00.000Z",
      resumeAt: "2026-12-11T12:00:00.000Z",
    });
    const changed = overlayReducer(paused, {
      type: "pause",
      presetId: "1m",
      now,
      resumeAt: "2026-12-11T12:00:00.000Z",
    });
    expect(changed.lifecycle).toMatchObject({
      pausedUntil: "2027-01-10T12:00:00.000Z",
      resumeAt: "2026-12-11T12:00:00.000Z",
    });
    expect(overlayReducer(changed, { type: "resume", now }).lifecycle).toEqual({
      status: "active",
      nextChargeAt: "2026-12-11T12:00:00.000Z",
    });
  });

  it("resume sets an active lifecycle at the stored resume date, or tomorrow", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: {
        status: "paused" as const,
        pausedUntil: null,
        presetId: "open" as const,
        resumeAt: "2026-11-11T12:00:00.000Z",
      },
    };
    expect(
      overlayReducer(paused, {
        type: "resume",
        now: new Date("2026-11-05T12:00:00.000Z"),
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
      ...committed,
      quantities: committed.quantities,
      skippedSkus: [],
      zeroSkus: [],
      lifecycle: { status: "active", nextChargeAt: "2026-12-06T12:00:00.000Z" },
    });
    expect(committed.skippedSkus).toEqual(["NW-VITD-60"]);
  });

  it("cancel sets a cancelled lifecycle at now", () => {
    const committed = {
      ...EMPTY_OVERLAY,
      quantities: { "NW-MULTI-30": 3 },
      lifecycle: { status: "active" as const, nextChargeAt: "2026-11-06T12:00:00.000Z" },
    };
    expect(
      overlayReducer(committed, {
        type: "cancel",
        now: new Date("2026-11-05T12:00:00.000Z"),
        reason: "cost",
      }),
    ).toEqual({
      ...committed,
      cancelReason: "cost",
      quantities: committed.quantities,
      skippedSkus: [],
      zeroSkus: [],
      lifecycle: { status: "cancelled", cancelledAt: "2026-11-05T12:00:00.000Z" },
    });
  });

  it("resume without a stored date schedules tomorrow", () => {
    const paused = {
      ...EMPTY_OVERLAY,
      lifecycle: {
        status: "paused" as const,
        pausedUntil: null,
        presetId: "open" as const,
        resumeAt: null,
      },
    };
    expect(
      overlayReducer(paused, { type: "resume", now: new Date("2026-11-05T12:00:00.000Z") }),
    ).toMatchObject({
      lifecycle: { status: "active", nextChargeAt: "2026-11-06T12:00:00.000Z" },
    });
  });
});
