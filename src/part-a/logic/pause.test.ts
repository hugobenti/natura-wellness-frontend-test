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

  it("pauseUntil moves one month 30 days and leaves open pauses undated", () => {
    expect(pauseUntil("1m", now)).toBe("2026-12-05T12:00:00.000Z");
    expect(pauseUntil("open", now)).toBeNull();
  });

  it("resumeChargeAt schedules tomorrow rather than charging immediately", () => {
    expect(resumeChargeAt(now)).toBe("2026-11-06T12:00:00.000Z");
  });
});
