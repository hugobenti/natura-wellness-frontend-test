import { useId } from "react";
import { quantityStepperContent } from "@/content/components/quantityStepper";
import { Icon } from "@/shared/icons/Icon";
import { cx } from "@/shared/utils/cx";
import { Button } from "../Button/Button";
import { quantityStepper } from "./QuantityStepper.style";
import type { IQuantityStepperProps } from "./QuantityStepper.type";
import { useQuantityStepper } from "./useQuantityStepper";

/** Decrease and increase buttons around a bounded quantity. It never removes an item. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  labelHidden = false,
  className,
}: IQuantityStepperProps) {
  const labelId = useId();
  const { decreaseRef, increaseRef, canDecrease, canIncrease, decrease, increase } =
    useQuantityStepper({ value, onChange, min, max });

  return (
    <div role="group" aria-labelledby={labelId} className={cx(quantityStepper.group, className)}>
      <span
        id={labelId}
        className={labelHidden ? quantityStepper.label.hidden : quantityStepper.label.visible}
      >
        {label}
      </span>
      <div className={quantityStepper.frame}>
        <Button
          ref={decreaseRef}
          variant="quiet"
          size="icon"
          aria-label={quantityStepperContent.decrease}
          disabled={!canDecrease}
          onClick={decrease}
        >
          <Icon name="minus" />
        </Button>
        <output aria-live="polite" className={quantityStepper.value}>
          {value}
        </output>
        <Button
          ref={increaseRef}
          variant="quiet"
          size="icon"
          aria-label={quantityStepperContent.increase}
          disabled={!canIncrease}
          onClick={increase}
        >
          <Icon name="plus" />
        </Button>
      </div>
    </div>
  );
}
