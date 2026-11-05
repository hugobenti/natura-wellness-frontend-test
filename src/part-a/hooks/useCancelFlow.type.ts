import type { Dispatch, RefObject } from "react";
import type { ICancelConfirmProps } from "../components/CancelConfirm/CancelConfirm.type";
import type { ICancelSurveyProps } from "../components/CancelSurvey/CancelSurvey.type";
import type { TOverlayAction } from "../logic/overlay.type";
import type { ISubscriptionView } from "../logic/subscriptionView.type";
import type { INotice } from "./notice.type";

export type TPageView = "subscription" | "cancelConfirm" | "survey";

export interface IUseCancelFlowArgs {
  subscription: ISubscriptionView | null;
  dispatch: Dispatch<TOverlayAction>;
  notify: (notice: INotice) => void;
  /** The edit mode's `start`. */
  startEdit: () => void;
}

export interface IUseCancelFlowResult {
  view: TPageView;
  open: () => void;
  back: () => void;
  editNextBox: () => void;
  confirmCancel: () => void;
  confirm: ICancelConfirmProps;
  survey: ICancelSurveyProps;
  /** Attach to the single `<h1>` of the current view. */
  h1Ref: RefObject<HTMLHeadingElement | null>;
}
