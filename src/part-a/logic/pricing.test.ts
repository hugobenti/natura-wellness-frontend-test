import { catalog, fixtures, totalAfterDiscount } from "@/api/fixtures";
import { describe, expect, it } from "vitest";
import { priceBox } from "./pricing";

const items = fixtures.active().items;

describe("priceBox", () => {
  it("matches the API's charged total and allocates cents to the largest remainder", () => {
    const result = priceBox(items, 15);

    expect(result).toEqual({
      subtotalCents: 11985,
      totalCents: 10187,
      savingCents: 1798,
      lines: [
        { sku: "NW-VITD-60", priceCents: 2546, compareAtCents: 2995 },
        { sku: "NW-MULTI-30", priceCents: 7641, compareAtCents: 8990 },
      ],
    });
    expect(result.totalCents).toBe(totalAfterDiscount(items, 15));
  });

  it("allocates ties to the earlier line", () => {
    const result = priceBox(
      [
        { sku: "first", name: "First", imageUrl: null, quantity: 1, unitPriceCents: 101 },
        { sku: "second", name: "Second", imageUrl: null, quantity: 1, unitPriceCents: 101 },
      ],
      50,
    );

    expect(result.lines.map((line) => line.priceCents)).toEqual([51, 50]);
  });

  it("line prices sum to the charged total for every quantity combination", () => {
    const products = catalog.slice(0, 3);
    for (let first = 1; first <= 5; first++) {
      for (let second = 1; second <= 5; second++) {
        for (let third = 1; third <= 5; third++) {
          const pricedItems = products.map((product, index) => ({
            ...product,
            quantity: [first, second, third][index],
          }));
          const result = priceBox(pricedItems, 15);
          expect(result.lines.reduce((sum, line) => sum + line.priceCents, 0)).toBe(
            result.totalCents,
          );
        }
      }
    }
  });

  it("returns zero totals and no lines for an empty box", () => {
    expect(priceBox([], 15)).toEqual({
      lines: [],
      subtotalCents: 0,
      totalCents: 0,
      savingCents: 0,
    });
  });

  it("charges the full price for every line when the discount is zero", () => {
    const result = priceBox(items, 0);
    expect(result.lines.every((line) => line.priceCents === line.compareAtCents)).toBe(true);
    expect(result.totalCents).toBe(11985);
  });
});
