import { fixtures } from "@/api/fixtures";
import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { deriveView, EMPTY_OVERLAY } from "./subscriptionView";

const overlayWith = (changes: Partial<typeof EMPTY_OVERLAY>) => ({ ...EMPTY_OVERLAY, ...changes });

describe("deriveView", () => {
  it("EMPTY_OVERLAY on active matches the API", () => {
    const snapshot = fixtures.active();
    const view = deriveView(snapshot, EMPTY_OVERLAY);

    expect(view.pricing.totalCents).toBe(snapshot.nextChargeTotalCents);
    expect(view.pricing.totalCents).toBe(10187);
    expect(view.status).toBe("active");
    expect(view.skipIsLocal).toBe(false);
    expect(view.id).toBe(snapshot.id);
    expect(view.updatedAt).toBe(snapshot.updatedAt);
  });

  it("quantities override the snapshot", () => {
    const view = deriveView(fixtures.active(), overlayWith({ quantities: { "NW-MULTI-30": 3 } }));

    expect(view.lines.find((line) => line.sku === "NW-MULTI-30")?.quantity).toBe(3);
    expect(view.pricing.totalCents).toBe(14008);
  });

  it("a skipped line is excluded and unpriced", () => {
    const view = deriveView(fixtures.active(), overlayWith({ skippedSkus: ["NW-VITD-60"] }));

    expect(view.lines.find((line) => line.sku === "NW-VITD-60")).toMatchObject({
      skipped: true,
      priceCents: null,
      compareAtCents: null,
    });
    expect(view.pricing.lines).toEqual([
      { sku: "NW-MULTI-30", priceCents: 7642, compareAtCents: 8990 },
    ]);
    expect(view.pricing.totalCents).toBe(7642);
  });

  it("skips are ignored unless active", () => {
    const view = deriveView(fixtures.paused(), overlayWith({ skippedSkus: ["NW-VITD-60"] }));

    expect(view.lines.every((line) => !line.skipped)).toBe(true);
    expect(view.pricing.totalCents).toBe(10187);
  });

  it("paused override clears the next charge and makes skipping local", () => {
    const view = deriveView(
      fixtures.active(),
      overlayWith({
        lifecycle: { status: "paused", pausedUntil: null, presetId: null, resumeAt: null },
      }),
    );

    expect(view.status).toBe("paused");
    expect(view.nextChargeAt).toBeNull();
    expect(view.pausedUntil).toBeNull();
    expect(view.cancelledAt).toBeNull();
    expect(view.skipIsLocal).toBe(true);
  });

  it("active override on the paused fixture replaces the pause date", () => {
    const nextChargeAt = "2026-12-01T12:00:00.000Z";
    const view = deriveView(
      fixtures.paused(),
      overlayWith({ lifecycle: { status: "active", nextChargeAt } }),
    );

    expect(view.status).toBe("active");
    expect(view.nextChargeAt).toBe(nextChargeAt);
    expect(view.pausedUntil).toBeNull();
    expect(view.cancelledAt).toBeNull();
    expect(view.skipIsLocal).toBe(true);
  });

  it("cancelled override replaces the cancellation date and clears the next charge", () => {
    const cancelledAt = "2026-11-05T12:00:00.000Z";
    const view = deriveView(
      fixtures.active(),
      overlayWith({ lifecycle: { status: "cancelled", cancelledAt } }),
    );

    expect(view.status).toBe("cancelled");
    expect(view.cancelledAt).toBe(cancelledAt);
    expect(view.nextChargeAt).toBeNull();
    expect(view.pausedUntil).toBeNull();
  });

  it("a new snapshot keeps overlay quantities", () => {
    const snapshot = fixtures.active();
    const moved = { ...snapshot, nextChargeAt: addDays(snapshot.nextChargeAt!, 30) };
    const view = deriveView(moved, overlayWith({ quantities: { "NW-MULTI-30": 3 } }));

    expect(view.nextChargeAt).toBe(moved.nextChargeAt);
    expect(view.lines.find((line) => line.sku === "NW-MULTI-30")?.quantity).toBe(3);
    expect(view.pricing.totalCents).toBe(14008);
  });

  it("without an override, paused and cancelled dates come from their snapshots", () => {
    const paused = fixtures.paused();
    const cancelled = fixtures.cancelled();

    expect(deriveView(paused, EMPTY_OVERLAY)).toMatchObject({
      status: "paused",
      pausedUntil: paused.pausedUntil,
      nextChargeAt: null,
      skipIsLocal: false,
    });
    expect(deriveView(cancelled, EMPTY_OVERLAY)).toMatchObject({
      status: "cancelled",
      cancelledAt: cancelled.cancelledAt,
      nextChargeAt: null,
      skipIsLocal: false,
    });
  });
});
