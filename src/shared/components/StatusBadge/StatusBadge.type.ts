import type { SubscriptionStatus } from "@/api/types";

export interface IStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}
