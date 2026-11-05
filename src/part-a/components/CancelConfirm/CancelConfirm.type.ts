import type { RefObject } from "react";

export interface ICancelConfirmProps {
  reasons: { title: string; body: string }[];
  /** `null` unless the subscription is active. */
  editLink: { label: string; onClick: () => void } | null;
  keepLabel: string;
  onKeep: () => void;
  cancelLabel: string;
  onCancel: () => void;
  backLabel: string;
  onBack: () => void;
}

export interface ICancelConfirmViewProps extends ICancelConfirmProps {
  title: string;
  lead: string;
  h1Ref: RefObject<HTMLHeadingElement | null>;
}
