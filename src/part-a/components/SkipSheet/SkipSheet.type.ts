import type { ISubscriptionDiff } from "../../logic/subscriptionDiff.type";
import type { TSkipPhase } from "../../hooks/useSkipFlow.type";

export interface ISkipSheetProps {
  open: boolean;
  phase: TSkipPhase;
  conflict: ISubscriptionDiff | null;
  changeItems: { key: string; message: string }[];
  factStyles: {
    nextBoxLabel: string;
    oldDate: string;
    newDate: string;
    chargeLabel: string;
    amount: string;
  };
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
