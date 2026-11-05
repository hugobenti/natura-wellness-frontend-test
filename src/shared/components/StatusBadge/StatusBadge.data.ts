import type { TIconName } from "@/shared/icons/Icon.type";
import type { SubscriptionStatus } from "@/api/types";

export const statusBadgeIcon: Record<SubscriptionStatus, TIconName> = {
  active: "check-circle",
  paused: "pause",
  cancelled: "x-circle",
};
