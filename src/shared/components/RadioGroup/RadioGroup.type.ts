import type { ReactNode } from "react";
import type { radioGroup } from "./RadioGroup.style";

export interface IRadioOption<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  description?: ReactNode;
  /** Right-aligned content inside the label, such as a price. */
  trailing?: ReactNode;
  badge?: ReactNode;
  /** Shown inside the card frame, outside the label, only while this option is selected. */
  panel?: ReactNode;
}

export interface IRadioItem<TValue extends string = string> extends IRadioOption<TValue> {
  checked: boolean;
  inputId: string;
  onSelect: () => void;
}

export interface IUseRadioGroupArgs<TValue extends string> {
  value: TValue;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<IRadioOption<TValue>>;
}

export interface IRadioGroupProps<TValue extends string> {
  legend: ReactNode;
  /** Keep the legend for screen readers only. */
  legendHidden?: boolean;
  /** Shared `name` of the native radios. */
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  appearance?: keyof typeof radioGroup.appearance;
  options: ReadonlyArray<IRadioOption<TValue>>;
  className?: string;
}
