export interface IUseQuantityStepperArgs {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

export interface IQuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Lowest allowed quantity. Defaults to 1; the stepper never removes an item. */
  min?: number;
  max?: number;
  label: string;
  /** Keeps the label for assistive technology but does not show it. */
  labelHidden?: boolean;
  className?: string;
}
