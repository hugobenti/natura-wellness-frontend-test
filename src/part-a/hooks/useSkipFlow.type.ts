import type { Subscription } from "@/api/types";
import type { ISubscriptionView } from "../logic/subscriptionView.type";
import type { ISubscriptionDiff } from "../logic/subscriptionDiff.type";
import type { INotice } from "./notice.type";

export type TSkipPhase = "confirm" | "pending" | "conflict" | "error";

export interface IUseSkipFlowArgs {
  view: ISubscriptionView | null;
  comparisonView: ISubscriptionView | null;
  reload: () => Promise<Subscription | null>;
  deriveFresh: (snapshot: Subscription) => ISubscriptionView;
  onSkipped: (snapshot: Subscription) => void;
  skipLocally: () => void;
  localSuccessAmount: () => number;
  successAmount: (snapshot: Subscription) => number;
  notify: (notice: INotice) => void;
}

export interface IUseSkipFlowResult {
  phase: TSkipPhase | null;
  conflict: ISubscriptionDiff | null;
  open: () => void;
  close: () => void;
  confirm: () => Promise<void>;
}
