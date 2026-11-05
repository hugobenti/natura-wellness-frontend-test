import type { IRadioOption } from "@/shared/components/RadioGroup/RadioGroup.type";
import type { RefObject } from "react";

export type TCancelReason = "tooMuch" | "cost" | "otherProduct" | "noResults" | "other";

export interface ICancelSurveyProps {
  value: TCancelReason | "";
  options: IRadioOption<TCancelReason>[];
  onChange: (value: TCancelReason) => void;
  sendDisabled: boolean;
  onSend: () => void;
  onSkip: () => void;
}

export interface ICancelSurveyViewProps extends ICancelSurveyProps {
  title: string;
  lead: string;
  h1Ref: RefObject<HTMLHeadingElement | null>;
}
