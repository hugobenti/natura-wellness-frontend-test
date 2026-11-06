import { quantityStepperContent } from "@/content/components/quantityStepper";
import { useQuantityStepper } from "@/shared/components/QuantityStepper/useQuantityStepper";
import { Icon } from "@/shared/icons/Icon";
import { quantityBox } from "./QuantityBox.style";
import type { IQuantityBoxProps } from "./QuantityBox.type";

/** A tall bordered box with decrease and increase buttons around the quantity. It never goes below `min`. */
export function QuantityBox({ value, onChange, label, min = 1, max = 10 }: IQuantityBoxProps) {
  const { decreaseRef, increaseRef, canDecrease, canIncrease, decrease, increase } =
    useQuantityStepper({ value, onChange, min, max });

  return (
    <div role="group" aria-label={label} className={quantityBox.frame}>
      <button
        ref={decreaseRef}
        type="button"
        aria-label={quantityStepperContent.decrease}
        disabled={!canDecrease}
        onClick={decrease}
        className={quantityBox.button}
      >
        <Icon name="minus" className={quantityBox.icon} />
      </button>
      <output aria-live="polite" className={quantityBox.value}>
        {value}
      </output>
      <button
        ref={increaseRef}
        type="button"
        aria-label={quantityStepperContent.increase}
        disabled={!canIncrease}
        onClick={increase}
        className={quantityBox.button}
      >
        <Icon name="plus" className={quantityBox.icon} />
      </button>
    </div>
  );
}
