import type { Ref, RefObject } from "react";
import type { ICancelConfirmProps } from "./components/CancelConfirm/CancelConfirm.type";
import type { ICancelSurveyProps } from "./components/CancelSurvey/CancelSurvey.type";
import type { TPageView } from "./hooks/useCancelFlow.type";
import type { IPauseSheetProps } from "./components/PauseSheet/PauseSheet.type";
import type { INotice } from "./hooks/notice.type";
import type { ISkipSheetProps } from "./components/SkipSheet/SkipSheet.type";
import type { IReceiptCardProps } from "./components/ReceiptCard/ReceiptCard.type";

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
      survey: ICancelSurveyProps;
      editHint: { text: string; cancelLabel: string; onCancel: () => void } | null;
      receipt: IReceiptCardProps;
      notice: INotice | null;
      skipSheet: ISkipSheetProps | null;
      pauseSheet: IPauseSheetProps;
      actions: IManageAction[];
    }
);
