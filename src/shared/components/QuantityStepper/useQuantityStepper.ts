import { useRef } from "react";
import { clampQuantity } from "@/shared/logic/quantity";
import type { IUseQuantityStepperArgs } from "./QuantityStepper.type";

/** Bounded +/- behavior; keeps focus on a usable button when a bound disables the clicked one. */
export function useQuantityStepper({ value, onChange, min, max }: IUseQuantityStepperArgs) {
  const decreaseRef = useRef<HTMLButtonElement>(null);
  const increaseRef = useRef<HTMLButtonElement>(null);

  const step = (delta: number) => {
    const next = clampQuantity(value + delta, min, max);
    onChange(next);
    // A button that disables itself drops focus to <body>; hand it to the other button first.
    if (delta > 0 && next >= max && next > min) decreaseRef.current?.focus();
    if (delta < 0 && next <= min && next < max) increaseRef.current?.focus();
  };

  return {
    decreaseRef,
    increaseRef,
    canDecrease: value > min,
    canIncrease: value < max,
    decrease: () => step(-1),
    increase: () => step(1),
  };
}
