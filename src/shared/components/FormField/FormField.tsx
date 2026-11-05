import { Icon } from "@/shared/icons/Icon";
import { cx } from "@/shared/utils/cx";
import { formField } from "./FormField.style";
import type { IFormFieldProps } from "./FormField.type";

/** Label, hint and error around one native control; ids come from `useFormField`. */
export function FormField({
  field,
  label,
  hint,
  error,
  layout = "stacked",
  children,
  className,
}: IFormFieldProps) {
  return (
    <div className={cx(formField.base, formField.layout[layout], className)}>
      <label htmlFor={field.controlId} className={formField.label}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={field.hintId} className={formField.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={field.errorId} role="alert" className={formField.error}>
          <Icon name="alert-triangle" className={formField.errorIcon} />
          {error}
        </p>
      )}
    </div>
  );
}
