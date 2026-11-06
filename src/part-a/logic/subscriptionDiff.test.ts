import { fixtures } from "@/api/fixtures";
import { describe, expect, it, vi } from "vitest";
import { addDays } from "./dates";
import { deriveView, EMPTY_OVERLAY } from "./subscriptionView";
import { diffSubscription } from "./subscriptionDiff";

const before = () => deriveView(fixtures.active(), EMPTY_OVERLAY);
const compare = (fresh = before()) =>
  diffSubscription(before(), fresh, new Date("2026-11-05T12:00:00Z"));

describe("diffSubscription", () => {
  it("ignores a version-only change", () => {
    expect(compare({ ...before(), updatedAt: "new-version" })).toEqual({
      messages: [],
      nextDateChanged: false,
      skipDateChanged: false,
      totalChanged: false,
    });
  });
  it("names changes to both the next charge and the date after skipping", () => {
    const fresh = before();
    fresh.nextChargeAt = addDays(fresh.nextChargeAt!, 2);
    expect(compare(fresh).messages).toEqual([
      expect.stringMatching(/^Next charge moved from .+ to .+$/),
      expect.stringMatching(/^Charge after skipping moved from .+ to .+$/),
    ]);
    expect(compare(fresh).nextDateChanged).toBe(true);
    expect(compare(fresh).skipDateChanged).toBe(true);
  });
  it("ignores a UTC date change that is the same displayed local day", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    try {
      const original = before();
      original.nextChargeAt = "2026-11-11T23:00:00Z";
      const refreshed = { ...original, nextChargeAt: "2026-11-12T01:00:00Z" };
      expect(
        diffSubscription(original, refreshed, new Date("2026-11-05T12:00:00Z")).nextDateChanged,
      ).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("detects a displayed local-day change within one UTC date", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    try {
      const original = before();
      original.nextChargeAt = "2026-11-11T01:00:00Z";
      const refreshed = { ...original, nextChargeAt: "2026-11-11T10:00:00Z" };
      expect(
        diffSubscription(original, refreshed, new Date("2026-11-05T12:00:00Z")).nextDateChanged,
      ).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("names a changed charge total", () => {
    const fresh = before();
    fresh.pricing = { ...fresh.pricing, totalCents: 7641 };
    expect(compare(fresh).messages).toContain("Total changed from $101.87 to $76.41");
    expect(compare(fresh).totalChanged).toBe(true);
  });
  it("names added and removed products and changed quantities", () => {
    const fresh = before();
    fresh.lines = [
      { ...fresh.lines[0]!, quantity: fresh.lines[0]!.quantity + 1 },
      {
        sku: "new",
        name: "New supplement",
        quantity: 1,
        skipped: false,
        imageUrl: null,
        priceCents: 100,
        compareAtCents: 100,
      },
    ];
    expect(compare(fresh).messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/quantity changed from \d+ to \d+/),
        "New supplement added",
        expect.stringMatching(/ removed$/),
      ]),
    );
  });
  it("names a changed status", () => {
    expect(compare({ ...before(), status: "paused" }).messages).toContain(
      "Subscription is now paused",
    );
  });
});
