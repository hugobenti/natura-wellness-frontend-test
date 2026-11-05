import type { ReactNode } from "react";
import type { TIconName } from "@/shared/icons/Icon.type";
import type { badge } from "./Badge.style";

export interface IBadgeProps {
  tone: keyof typeof badge.tone;
  /** Decorative; the text always carries the meaning. */
  icon?: TIconName;
  children: ReactNode;
  className?: string;
}
