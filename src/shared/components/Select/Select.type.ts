import type { ReactNode } from "react";
import type { IFormFieldProps } from "../FormField/FormField.type";

interface ISelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface ISelectProps<TValue extends string> extends Pick<
  IFormFieldProps,
  "layout" | "className"
> {
  label: ReactNode;
  value: TValue;
  onChange: (value: TValue) => void;
  options: Array<ISelectOption<TValue>>;
  hint?: ReactNode;
  error?: ReactNode;
}

export interface IUseSelectArgs<TValue extends string> {
  onChange: (value: TValue) => void;
  hint?: ReactNode;
  error?: ReactNode;
}
