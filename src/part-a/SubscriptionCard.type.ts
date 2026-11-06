import type { Ref, RefObject } from "react";
import type { IActivationDialogProps } from "./components/ActivationDialog/ActivationDialog.type";
import type { ICancelConfirmProps } from "./components/CancelConfirm/CancelConfirm.type";
import type { IPauseSheetProps } from "./components/PauseSheet/PauseSheet.type";
import type { IReceiptCardProps } from "./components/ReceiptCard/ReceiptCard.type";
import type { ISkipSheetProps } from "./components/SkipSheet/SkipSheet.type";
import type { TPageView } from "./hooks/useCancelFlow.type";
import type { INotice } from "./hooks/notice.type";
export interface IManageAction {
  key: string;
  label: string;
  variant: "primary" | "secondary" | "quiet";
  onClick: () => void;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export type TPageModel = { h1Ref: RefObject<HTMLHeadingElement | null> } & (
  | { kind: "loading" }
  | { kind: "error"; onRetry: () => void }
  | {
      kind: "ready";
      pageView: TPageView;
      confirm: ICancelConfirmProps;
      editHint: { text: string; cancelLabel: string; onCancel: () => void } | null;
      editFrequency: {
        value: string;
        options: Array<{ value: string; label: string }>;
        onChange: (value: string) => void;
      } | null;
      receipt: IReceiptCardProps;
      notice: INotice | null;
      dismissNotice: () => void;
      skipSheet: ISkipSheetProps | null;
      pauseSheet: IPauseSheetProps;
      activationDialog: IActivationDialogProps;
      actions: IManageAction[];
    }
);
