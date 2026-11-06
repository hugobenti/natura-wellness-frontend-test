import { useId } from "react";
import { Icon } from "@/shared/icons/Icon";
import { frequencySelect } from "./FrequencySelect.style";
import type { IFrequencySelectProps } from "./FrequencySelect.type";

/** A label and a compact native select for how often the subscription ships. */
export function FrequencySelect({ label, value, options, onChange }: IFrequencySelectProps) {
  const selectId = useId();

  return (
    <div className={frequencySelect.row}>
      <label htmlFor={selectId} className={frequencySelect.label}>
        {label}
      </label>
      <div className={frequencySelect.wrapper}>
        <select id={selectId} value={value} onChange={onChange} className={frequencySelect.control}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" className={frequencySelect.chevron} />
      </div>
    </div>
  );
}
