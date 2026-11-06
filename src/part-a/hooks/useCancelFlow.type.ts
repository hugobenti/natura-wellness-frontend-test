import type { Dispatch, RefObject } from "react";
import type { ICancelConfirmProps } from "../components/CancelConfirm/CancelConfirm.type";
import type { TOverlayAction } from "../logic/overlay.type";
import type { ISubscriptionView } from "../logic/subscriptionView.type";
import type { INotice } from "./notice.type";

export type TPageView = "subscription" | "cancelConfirm";

export interface IUseCancelFlowArgs {
  subscription: ISubscriptionView | null;
  dispatch: Dispatch<TOverlayAction>;
  notify: (notice: INotice) => void;
  /** Clears the page notice when the customer moves to another view. */
  clearNotice: () => void;
  openSkip: () => void;
  openPause: () => void;
}

export interface IUseCancelFlowResult {
  view: TPageView;
  open: () => void;
  confirm: ICancelConfirmProps;
  /** Attach to the single `<h1>` of the current view. */
  h1Ref: RefObject<HTMLHeadingElement | null>;
}
