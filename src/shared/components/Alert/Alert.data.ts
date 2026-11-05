import type { TIconName } from "@/shared/icons/Icon.type";
import type { TAlertTone } from "./Alert.type";

/** Errors interrupt (`alert`); successes and information wait their turn (`status`). */
export const alertRole: Record<TAlertTone, "status" | "alert"> = {
  success: "status",
  info: "status",
  danger: "alert",
};

export const alertIcon: Record<TAlertTone, TIconName> = {
  success: "check-circle",
  info: "info",
  danger: "alert-triangle",
};
