import type { Subscription } from "@/api/types";

export type TLoadState =
  { status: "loading" } | { status: "error" } | { status: "ready"; snapshot: Subscription };

export interface IUseSubscriptionResult {
  state: TLoadState;
  retry: () => void;
  reload: () => Promise<Subscription | null>;
  replace: (snapshot: Subscription) => void;
}
