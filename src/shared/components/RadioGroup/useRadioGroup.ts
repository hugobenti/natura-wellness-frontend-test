import { useId } from "react";
import type { IRadioItem, IUseRadioGroupArgs } from "./RadioGroup.type";

/** Per-option state for `RadioGroup`: checked flag, input id and a select handler. */
export function useRadioGroup<TValue extends string>({
  value,
  onChange,
  options,
}: IUseRadioGroupArgs<TValue>): { items: Array<IRadioItem<TValue>> } {
  const id = useId();

  return {
    items: options.map((option, index) => ({
      ...option,
      checked: option.value === value,
      inputId: `${id}-${index}`,
      onSelect: () => onChange(option.value),
    })),
  };
}
