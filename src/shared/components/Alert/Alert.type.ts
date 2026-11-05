import type { ReactNode } from "react";
import type { alert } from "./Alert.style";

export type TAlertTone = keyof typeof alert.tone;

export interface IAlertProps {
  tone: TAlertTone;
  title: string;
  children?: ReactNode;
  /** Usually a quiet `Button`, placed next to the message. */
  action?: ReactNode;
  /** Renders a close button in the top-right corner. For page-level outcome notices only. */
  onDismiss?: () => void;
  className?: string;
}
