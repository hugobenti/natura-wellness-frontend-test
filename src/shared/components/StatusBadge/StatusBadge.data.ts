import type { TIconName } from "@/shared/icons/Icon.type";
import type { TSubscriptionStatus } from "./StatusBadge.type";

export const statusBadgeIcon: Record<TSubscriptionStatus, TIconName> = {
  active: "check-circle",
  paused: "pause",
  cancelled: "x-circle",
};
