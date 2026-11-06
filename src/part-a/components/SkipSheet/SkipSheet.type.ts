import type { ISubscriptionDiff } from "../../logic/subscriptionDiff.type";
import type { TSkipPhase } from "../../hooks/useSkipFlow.type";

export interface ISkipSheetProps {
  open: boolean;
  phase: TSkipPhase;
  conflict: ISubscriptionDiff | null;
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
