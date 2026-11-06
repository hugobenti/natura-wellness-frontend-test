import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, test } from "vitest";
import { copy } from "./copy";
import { useBuyBox } from "./useBuyBox";

const pick = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLSelectElement>;

describe("useBuyBox", () => {
  test("starts on the subscription at the default frequency and quantity 1", () => {
    const { result } = renderHook(() => useBuyBox());
    expect(result.current.option).toBe("subscribe");
    expect(result.current.frequency).toBe("30 days");
    expect(result.current.quantity).toBe(1);
    expect(result.current.addToCartPrice).toBe("$25.46");
    expect(result.current.renewal).toBe(copy.finePrint);
  });

  test("a one-time purchase charges the full price and has nothing to renew", () => {
    const { result } = renderHook(() => useBuyBox());
    act(() => result.current.selectOption("oneTime"));
    expect(result.current.option).toBe("oneTime");
    expect(result.current.addToCartPrice).toBe("$29.95");
    expect(result.current.renewal).toBeNull();
  });

  test("the quantity multiplies the charge shown on the button and in the fine print", () => {
    const { result } = renderHook(() => useBuyBox());
    act(() => result.current.setQuantity(3));
    expect(result.current.addToCartPrice).toBe("$76.38");
    expect(result.current.renewal).toContain("at $76.38");
    act(() => result.current.selectOption("oneTime"));
    expect(result.current.addToCartPrice).toBe("$89.85");
  });

  test("the picked frequency shows in the fine print and survives switching options", () => {
    const { result } = renderHook(() => useBuyBox());
    act(() => result.current.onFrequencyChange(pick("90 days")));
    expect(result.current.frequency).toBe("90 days");
    expect(result.current.renewal).toContain("every 90 days");
    act(() => result.current.selectOption("oneTime"));
    act(() => result.current.selectOption("subscribe"));
    expect(result.current.frequency).toBe("90 days");
    expect(result.current.renewal).toContain("every 90 days");
  });
});
