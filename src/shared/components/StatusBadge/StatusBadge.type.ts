export type TSubscriptionStatus = "active" | "paused" | "cancelled";

export interface IStatusBadgeProps {
  status: TSubscriptionStatus;
}
