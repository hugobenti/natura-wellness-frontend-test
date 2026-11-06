import { fixtures } from "@/api/fixtures";
import { describe, expect, it } from "vitest";
import { deriveReceiptPresentation } from "./receiptPresentation";
import { deriveView, EMPTY_OVERLAY } from "./subscriptionView";

describe("deriveReceiptPresentation", () => {
  it("keeps active item prices and savings comparisons prominent", () => {
    const view = deriveView(fixtures.active(), EMPTY_OVERLAY);
    const receipt = deriveReceiptPresentation(view);

    expect(receipt.groupLabel).toBeNull();
    expect(receipt.lines.find((line) => line.sku === "NW-MULTI-30")).toMatchObject({
      priceCents: 7641,
      compareAtCents: 8990,
      mutedPrice: null,
    });
  });

  it("labels paused products as a future box without compare-at prices", () => {
    const receipt = deriveReceiptPresentation(deriveView(fixtures.paused(), EMPTY_OVERLAY));

    expect(receipt.groupLabel).toBe("Box when you resume");
    expect(receipt.lines.find((line) => line.sku === "NW-MULTI-30")).toMatchObject({
      priceCents: 7641,
      compareAtCents: null,
      mutedPrice: "$76.41",
    });
  });

  it("labels cancelled products as the last box without compare-at prices", () => {
    const receipt = deriveReceiptPresentation(deriveView(fixtures.cancelled(), EMPTY_OVERLAY));

    expect(receipt.groupLabel).toBe("Last box");
    expect(receipt.lines.find((line) => line.sku === "NW-MULTI-30")).toMatchObject({
      priceCents: 7641,
      compareAtCents: null,
      mutedPrice: "$76.41",
    });
  });
});
