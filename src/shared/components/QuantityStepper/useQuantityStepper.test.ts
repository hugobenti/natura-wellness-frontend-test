import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQuantityStepper } from "./useQuantityStepper";

function setup(value: number) {
  const onChange = vi.fn();
  const { result } = renderHook(() => useQuantityStepper({ value, onChange, min: 1, max: 10 }));
  return { result, onChange };
}

describe("useQuantityStepper", () => {
  it("steps down and up by one", () => {
    const { result, onChange } = setup(5);
    result.current.decrease();
    result.current.increase();
    expect(onChange).toHaveBeenNthCalledWith(1, 4);
    expect(onChange).toHaveBeenNthCalledWith(2, 6);
  });

  it("disables decrease at min and increase at max", () => {
    expect(setup(1).result.current).toMatchObject({ canDecrease: false, canIncrease: true });
    expect(setup(10).result.current).toMatchObject({ canDecrease: true, canIncrease: false });
  });

  it("clamps an out-of-bounds value", () => {
    const { result, onChange } = setup(12);
    result.current.decrease();
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
