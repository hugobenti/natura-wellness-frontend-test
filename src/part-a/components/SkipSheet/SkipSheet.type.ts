import type { TSkipPhase } from "../../hooks/useSkipFlow.type";

export interface ISkipSheetProps {
  open: boolean;
  phase: TSkipPhase;
  oldDate: string;
  newDate: string;
  amount: string;
  confirmLabel: string;
  chargeLabel: string;
  nothingNote: string;
  errorBody: string;
  onConfirm: () => void;
  onClose: () => void;
}
