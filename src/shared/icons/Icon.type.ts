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
  | "star"
  | "close";

export interface IIconProps {
  name: TIconName;
  /** Paints the shape solid in `currentColor` instead of drawing only its outline. */
  filled?: boolean;
  className?: string;
}
