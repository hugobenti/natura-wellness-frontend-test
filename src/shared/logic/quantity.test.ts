import { describe, expect, it } from "vitest";
import { clampQuantity } from "./quantity";

describe("clampQuantity", () => {
  it("raises values below min to min", () => {
    expect(clampQuantity(0, 1, 10)).toBe(1);
  });

  it("lowers values above max to max", () => {
    expect(clampQuantity(11, 1, 10)).toBe(10);
  });

  it("truncates to an integer", () => {
    expect(clampQuantity(3.7, 1, 10)).toBe(3);
  });
});
