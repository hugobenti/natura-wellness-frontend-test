import type { IRadioOption } from "@/shared/components/RadioGroup/RadioGroup.type";
import type { RefObject } from "react";
import type { TCancelReason } from "../../logic/cancelReason.type";

export interface ICancelOffer {
  kind: "skip" | "cadence" | "browse" | "support";
  title: string;
  body: string;
  label?: string;
  onAccept?: () => void;
  supportLink?: { href: string; label: string };
}

export interface ICancelConfirmProps {
  value: TCancelReason | "";
  options: IRadioOption<TCancelReason>[];
  onChange: (value: TCancelReason) => void;
  offer: ICancelOffer | null;
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
