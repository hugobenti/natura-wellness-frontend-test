import type { IRadioOption } from "@/shared/components/RadioGroup/RadioGroup.type";
import type { TPausePresetId } from "../../logic/pause.type";

export interface IPauseSheetProps {
  open: boolean;
  title: string;
  intro: string;
  value: TPausePresetId | "";
  options: IRadioOption<TPausePresetId>[];
  onChange: (value: TPausePresetId) => void;
  confirmLabel: string;
  confirmDisabled: boolean;
  onConfirm: () => void;
  keepLabel: string;
  onClose: () => void;
}
