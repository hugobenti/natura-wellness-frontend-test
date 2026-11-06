import type { RefObject } from "react";
import type { IRadioOption } from "@/shared/components/RadioGroup/RadioGroup.type";

export type TCancelReason = "tooMuch" | "cost" | "otherProduct" | "noResults" | "other";
export interface ICancelOffer {
  kind: "skip" | "cadence" | "swap" | "support";
  title: string;
  body: string;
  label: string;
  onAccept: () => void;
  supportLink?: { href: string; label: string };
  fromOptions?: IRadioOption[];
  fromSku?: string;
  onFromChange?: (value: string) => void;
  productOptions?: IRadioOption[];
  productSku?: string;
  onProductChange?: (value: string) => void;
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
