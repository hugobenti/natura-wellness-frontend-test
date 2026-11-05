import type { ReactNode } from "react";
import type { formField } from "./FormField.style";

export interface IFormFieldIds {
  controlId: string;
  hintId: string;
  errorId: string;
  /** Space-joined ids of the hint and error that are present; `undefined` when neither is. */
  describedBy: string | undefined;
  /** `true` only when there is an error. */
  invalid: true | undefined;
}

export interface IUseFormFieldArgs {
  hint?: ReactNode;
  error?: ReactNode;
}

export interface IFormFieldProps {
  /** The ids from `useFormField`; put `controlId`, `describedBy` and `invalid` on the control. */
  field: IFormFieldIds;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  layout?: keyof typeof formField.layout;
  /** The native control. */
  children: ReactNode;
  className?: string;
}
