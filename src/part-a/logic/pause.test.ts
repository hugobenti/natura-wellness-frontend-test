import { describe, expect, it } from "vitest";
import { PAUSE_PRESETS, pauseUntil, resumeChargeAt } from "./pause";

describe("pause dates", () => {
  const now = new Date("2026-11-05T12:00:00.000Z");

  it("offers 30, 60 and 90 day choices and an open-ended pause", () => {
    expect(PAUSE_PRESETS).toEqual([
      { id: "1m", days: 30 },
      { id: "2m", days: 60 },
      { id: "3m", days: 90 },
      { id: "open", days: null },
    ]);
  });

  it("counts a timed pause from the effective next charge, not today", () => {
    expect(pauseUntil("1m", "2026-12-11T12:00:00.000Z", now)).toBe("2027-01-10T12:00:00.000Z");
    expect(pauseUntil("open", "2026-12-11T12:00:00.000Z", now)).toBeNull();
  });

  it("resumeChargeAt schedules tomorrow rather than charging immediately", () => {
    expect(resumeChargeAt(now, null)).toBe("2026-11-06T12:00:00.000Z");
  });

  it("resumeChargeAt keeps a later original charge date", () => {
    expect(resumeChargeAt(now, "2026-11-11T12:00:00.000Z")).toBe("2026-11-11T12:00:00.000Z");
  });

  it("resumeChargeAt ignores an original charge date that already passed", () => {
    expect(resumeChargeAt(now, "2026-11-01T12:00:00.000Z")).toBe("2026-11-06T12:00:00.000Z");
  });
});
