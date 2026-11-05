export type TIconName =
  | "check"
  | "check-circle"
  | "pause"
  | "x-circle"
  | "alert-triangle"
  | "info"
  | "chevron-down"
  | "minus"
  | "plus"
  | "close";

export interface IIconProps {
  name: TIconName;
  className?: string;
}
