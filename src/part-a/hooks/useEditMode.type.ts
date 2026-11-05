import type { Subscription } from "@/api/types";
import type { Dispatch, RefObject } from "react";
import type { TOverlayAction } from "../logic/overlay.type";
import type { ILocalOverlay, ISubscriptionView } from "../logic/subscriptionView.type";
import type { INotice } from "./notice.type";

export interface IUseEditModeArgs {
  overlay: ILocalOverlay;
  snapshot: Subscription | null;
  dispatch: Dispatch<TOverlayAction>;
  notify: (notice: INotice) => void;
}

export interface IUseEditModeResult {
  editing: boolean;
  draftView: ISubscriptionView | null;
  start: () => void;
  save: () => void;
  cancel: () => void;
  setQuantity: (sku: string, quantity: number) => void;
  toggleSkip: (sku: string) => void;
  canSkip: (sku: string) => boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  editButtonRef: RefObject<HTMLButtonElement | null>;
}
