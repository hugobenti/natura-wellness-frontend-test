export type TIconName =
  | "check"
  | "check-circle"
  | "pause"
  | "x-circle"
  | "alert-triangle"
  | "info"
  | "arrow-left"
  | "chevron-down"
  | "minus"
  | "plus"
  | "close";

export interface IIconProps {
  name: TIconName;
  className?: string;
}
