import { skipNextShipment } from "@/api/mockApi";
import { ApiError } from "@/api/types";
import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useRef, useState } from "react";
import { addDays, formatDay } from "../logic/dates";
import { diffSubscription } from "../logic/subscriptionDiff";
import type { ISubscriptionDiff } from "../logic/subscriptionDiff.type";
import type { IUseSkipFlowArgs, IUseSkipFlowResult, TSkipPhase } from "./useSkipFlow.type";

export function useSkipFlow({
  view,
  reload,
  deriveFresh,
  onSkipped,
  skipLocally,
  localSuccessAmount,
  successAmount,
  notify,
}: IUseSkipFlowArgs): IUseSkipFlowResult {
  const [phase, setPhase] = useState<TSkipPhase | null>(null);
  const [conflict, setConflict] = useState<ISubscriptionDiff | null>(null);
  const pendingRef = useRef(false);
  const copy = subscriptionContent.skip;
  const open = () => {
    if (view?.status === "active" && !pendingRef.current) {
      setConflict(null);
      setPhase("confirm");
    }
  };
  const close = () => {
    if (!pendingRef.current) {
      setConflict(null);
      setPhase(null);
    }
  };

  const confirm = async () => {
    if (pendingRef.current || phase === null || view?.status !== "active") return;
    if (view.skipIsLocal) {
      skipLocally();
      setPhase(null);
      notify({
        tone: "success",
        title: copy.successTitle,
        body: copy.successBody(
          formatMoney(localSuccessAmount()),
          formatDay(addDays(view.nextChargeAt!, view.intervalDays), new Date()),
        ),
      });
      return;
    }
    pendingRef.current = true;
    setPhase("pending");
    try {
      const snapshot = await skipNextShipment({
        subscriptionId: view.id,
        expectedUpdatedAt: view.updatedAt,
      });
      onSkipped(snapshot);
      setPhase(null);
      notify({
        tone: "success",
        title: copy.successTitle,
        body: copy.successBody(
          formatMoney(successAmount(snapshot)),
          formatDay(snapshot.nextChargeAt!, new Date()),
        ),
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 409 || error.status === 400)) {
        try {
          const fresh = await reload();
          if (!fresh) {
            setPhase("error");
          } else if (fresh.status !== "active") {
            setPhase(null);
            notify({
              tone: "info",
              title: copy.changedTitle,
              body: fresh.status === "paused" ? copy.pausedElsewhere : copy.cancelledElsewhere,
            });
          } else {
            setConflict(diffSubscription(view, deriveFresh(fresh), new Date()));
            setPhase("conflict");
          }
        } catch {
          setPhase("error");
        }
      } else {
        setPhase("error");
      }
    } finally {
      pendingRef.current = false;
    }
  };

  return { phase, conflict, open, close, confirm };
}
