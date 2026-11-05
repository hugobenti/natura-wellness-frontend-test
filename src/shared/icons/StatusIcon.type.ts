export type TStatus = "active" | "paused" | "cancelled" | "danger";

export interface IStatusIconProps {
  status: TStatus;
  className?: string;
}
