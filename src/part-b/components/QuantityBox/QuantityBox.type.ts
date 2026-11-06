export interface IQuantityBoxProps {
  value: number;
  onChange: (value: number) => void;
  /** Names the group for assistive technology. */
  label: string;
  /** Lowest allowed quantity. Defaults to 1. */
  min?: number;
  max?: number;
}
