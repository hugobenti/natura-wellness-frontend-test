import type { ChangeEvent } from "react";

export interface IFrequencySelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}
