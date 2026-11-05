import { describe, expect, it } from "vitest";
import { initialOf } from "./initial";

describe("initialOf", () => {
  it("returns the uppercased first letter of the first word", () => {
    expect(initialOf("Vitamin D, 60 softgels")).toBe("V");
  });

  it("skips leading whitespace and uppercases", () => {
    expect(initialOf("  magnesium")).toBe("M");
  });

  it("returns an empty string for blank input", () => {
    expect(initialOf("")).toBe("");
    expect(initialOf("   ")).toBe("");
  });
});
