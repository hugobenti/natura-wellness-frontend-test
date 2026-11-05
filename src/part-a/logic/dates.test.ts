import { describe, expect, it } from "vitest";
import { addDays, formatDay } from "./dates";

const now = new Date("2026-11-05T12:00:00Z");
const options = { locale: "en-US", timeZone: "UTC" };

describe("addDays", () => {
  it("moves an ISO timestamp by calendar-length days", () => {
    expect(addDays("2026-11-11T12:00:00.000Z", 30)).toBe("2026-12-11T12:00:00.000Z");
  });
});

describe("formatDay", () => {
  it("shows the weekday, month and day in the current year", () => {
    expect(formatDay("2026-11-11T12:00:00.000Z", now, options)).toBe("Wed, Nov 11");
  });

  it("includes the year when it differs from the current year", () => {
    expect(formatDay("2027-01-04T12:00:00.000Z", now, options)).toBe("Mon, Jan 4, 2027");
  });

  it("uses the user's timezone for the local day", () => {
    expect(
      formatDay("2026-11-11T02:00:00.000Z", now, {
        locale: "en-US",
        timeZone: "America/New_York",
      }),
    ).toBe("Tue, Nov 10");
  });

  it("compares years in the user's timezone, not UTC", () => {
    expect(
      formatDay("2027-01-01T02:00:00.000Z", new Date("2027-01-01T03:00:00Z"), {
        locale: "en-US",
        timeZone: "America/New_York",
      }),
    ).toBe("Thu, Dec 31");
  });
});
