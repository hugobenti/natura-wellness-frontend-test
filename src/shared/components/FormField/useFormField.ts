import { useId } from "react";
import type { IFormFieldIds, IUseFormFieldArgs } from "./FormField.type";

/** Ids that tie a control to its label, hint and error. Spread `describedBy` and `invalid` on the control. */
export function useFormField({ hint, error }: IUseFormFieldArgs = {}): IFormFieldIds {
  const id = useId();
  const controlId = `${id}-control`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return {
    controlId,
    hintId,
    errorId,
    describedBy: describedBy || undefined,
    invalid: error ? true : undefined,
  };
}
