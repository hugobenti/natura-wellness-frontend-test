import type { Dispatch } from "react";
import type { IPauseSheetProps } from "../components/PauseSheet/PauseSheet.type";
import type { TOverlayAction } from "../logic/overlay.type";
import type { ILocalOverlay, ISubscriptionView } from "../logic/subscriptionView.type";
import type { INotice } from "./notice.type";

export interface IUsePauseFlowArgs {
  view: ISubscriptionView | null;
  overlay: ILocalOverlay;
  dispatch: Dispatch<TOverlayAction>;
  notify: (notice: INotice) => void;
}

export interface IUsePauseFlowResult {
  sheet: IPauseSheetProps;
  openPause: () => void;
  openChange: () => void;
  resume: () => void;
}
