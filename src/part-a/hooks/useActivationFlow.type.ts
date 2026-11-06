import type { Dispatch } from "react";
import type { IActivationDialogProps } from "../components/ActivationDialog/ActivationDialog.type";
import type { TOverlayAction } from "../logic/overlay.type";
import type { ILocalOverlay, ISubscriptionView } from "../logic/subscriptionView.type";
import type { INotice } from "./notice.type";

export interface IUseActivationFlowArgs {
  view: ISubscriptionView | null;
  overlay: ILocalOverlay;
  dispatch: Dispatch<TOverlayAction>;
  notify: (notice: INotice) => void;
}

export interface IUseActivationFlowResult {
  dialog: IActivationDialogProps;
  open: () => void;
}
