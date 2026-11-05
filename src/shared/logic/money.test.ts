import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats cents as US dollars", () => {
    expect(formatMoney(2546)).toBe("$25.46");
  });

  it("formats zero with two decimals", () => {
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("groups thousands", () => {
    expect(formatMoney(123456)).toBe("$1,234.56");
  });
});
