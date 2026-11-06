import { describe, expect, test } from "vitest";
import { copy } from "../copy";
import { renewalNote } from "./purchase";

describe("renewalNote", () => {
  test("keeps the provided sentence for the default frequency and price", () => {
    expect(renewalNote(copy, "30 days", 2546)).toBe(copy.finePrint);
  });

  test("follows the picked frequency", () => {
    expect(renewalNote(copy, "90 days", 2546)).toBe(
      "Your subscription renews every 90 days at $25.46 until you cancel. Skip or cancel anytime from your account.",
    );
  });

  test("follows the total of the picked quantity", () => {
    expect(renewalNote(copy, "60 days", 5092)).toBe(
      "Your subscription renews every 60 days at $50.92 until you cancel. Skip or cancel anytime from your account.",
    );
  });
});
