import { skipNextShipment } from "@/api/mockApi";
import { ApiError } from "@/api/types";
import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useRef, useState } from "react";
import { formatDay } from "../logic/dates";
import type { IUseSkipFlowArgs, IUseSkipFlowResult, TSkipPhase } from "./useSkipFlow.type";

export function useSkipFlow({
  view,
  reload,
  onSkipped,
  notify,
}: IUseSkipFlowArgs): IUseSkipFlowResult {
  const [phase, setPhase] = useState<TSkipPhase | null>(null);
  const pendingRef = useRef(false);
  const copy = subscriptionContent.skip;

  const open = () => {
    if (!pendingRef.current) setPhase("confirm");
  };
  const close = () => {
    if (!pendingRef.current) setPhase(null);
  };

  const confirm = async () => {
    if (pendingRef.current || phase === null || view.status !== "active") return;
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
          formatMoney(snapshot.nextChargeTotalCents!),
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
            notify({ tone: "info", title: copy.changedTitle, body: copy.changedBody });
          } else {
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

  return { phase, open, close, confirm };
}
