import type { ChangeEvent } from "react";
import { useFormField } from "../FormField/useFormField";
import type { IUseSelectArgs } from "./Select.type";

/** Field ids for a `Select` plus a change handler that passes the chosen value to `onChange`. */
export function useSelect<TValue extends string>({
  onChange,
  hint,
  error,
}: IUseSelectArgs<TValue>) {
  const field = useFormField({ hint, error });

  return {
    field,
    onSelectChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(event.target.value as TValue),
  };
}
