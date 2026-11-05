import { Icon } from "@/shared/icons/Icon";
import { FormField } from "../FormField/FormField";
import { select } from "./Select.style";
import type { ISelectProps } from "./Select.type";
import { useSelect } from "./useSelect";

/** Native select with a chevron, labelled by `FormField` with optional hint and error. */
export function Select<TValue extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  layout = "stacked",
  className,
}: ISelectProps<TValue>) {
  const { field, onSelectChange } = useSelect({ onChange, hint, error });

  return (
    <FormField
      field={field}
      label={label}
      hint={hint}
      error={error}
      layout={layout}
      className={className}
    >
      <div className={select.wrapper}>
        <select
          id={field.controlId}
          value={value}
          onChange={onSelectChange}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid}
          className={select.control}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" className={select.chevron} />
      </div>
    </FormField>
  );
}
