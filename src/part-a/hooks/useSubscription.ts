import { getSubscription } from "@/api/mockApi";
import type { Subscription } from "@/api/types";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IUseSubscriptionResult, TLoadState } from "./useSubscription.type";

export function useSubscription(): IUseSubscriptionResult {
  const [state, setState] = useState<TLoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;
    getSubscription().then(
      (snapshot) => {
        if (active && id === requestId.current) setState({ status: "ready", snapshot });
      },
      () => {
        if (active && id === requestId.current) setState({ status: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  const reload = useCallback(async (): Promise<Subscription | null> => {
    const id = ++requestId.current;
    try {
      const snapshot = await getSubscription();
      if (id === requestId.current) setState({ status: "ready", snapshot });
      return snapshot;
    } catch {
      return null;
    }
  }, []);

  const replace = useCallback((snapshot: Subscription) => {
    requestId.current++;
    setState({ status: "ready", snapshot });
  }, []);

  return { state, retry, reload, replace };
}
