import { catalog } from "@/api/fixtures";
import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { useEffect, useRef, useState } from "react";
import type { ICancelOffer } from "../components/CancelConfirm/CancelConfirm.type";
import { addDays, formatDay } from "../logic/dates";
import type { TCancelReason } from "../logic/cancelReason.type";
import type { IUseCancelFlowArgs, IUseCancelFlowResult, TPageView } from "./useCancelFlow.type";

const REASONS: TCancelReason[] = ["tooMuch", "cost", "otherProduct", "noResults", "other"];

export function useCancelFlow({
  subscription,
  dispatch,
  notify,
  clearNotice,
  openSkip,
  openPause,
}: IUseCancelFlowArgs): IUseCancelFlowResult {
  const [view, setView] = useState<TPageView>("subscription");
  const [reason, setReason] = useState<TCancelReason | "">("");
  const [fromSku, setFromSku] = useState("");
  const [productSku, setProductSku] = useState("");
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const shownView = useRef<TPageView>("subscription");
  const copy = subscriptionContent.cancel;
  const now = new Date();
  const cancellable = subscription?.status === "active" || subscription?.status === "paused";
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    window.scrollTo({ top: 0 });
    h1Ref.current?.focus();
  }, [view]);
  const back = () => {
    clearNotice();
    setView("subscription");
  };
  const open = () => {
    if (!cancellable) return;
    clearNotice();
    setReason("");
    setFromSku(subscription?.lines[0]?.sku ?? "");
    setProductSku(
      catalog.find(
        (product) =>
          product.sku !== "NW-ESSENTIALS" &&
          !subscription?.lines.some((line) => line.productSku === product.sku),
      )?.sku ?? "",
    );
    setView("cancelConfirm");
  };
  const finishOffer = (title: string, body: string) => {
    setView("subscription");
    notify({ tone: "success", title, body });
  };
  const availableProducts = catalog.filter(
    (product) =>
      product.sku !== "NW-ESSENTIALS" &&
      !subscription?.lines.some((line) => line.productSku === product.sku),
  );
  let offer: ICancelOffer | null = null;
  if (reason === "tooMuch" && subscription?.status === "active" && subscription.nextChargeAt) {
    const moved = formatDay(addDays(subscription.nextChargeAt, subscription.intervalDays), now);
    offer = {
      kind: "skip",
      title: copy.skipTitle,
      body: copy.skipBody(moved),
      label: copy.skipAction,
      onAccept: () => {
        setView("subscription");
        openSkip();
      },
    };
  } else if (
    reason === "cost" &&
    subscription?.status === "active" &&
    subscription.intervalDays < 60
  ) {
    const yearlyDifference = Math.round(
      subscription.pricing.totalCents * (365 / subscription.intervalDays - 365 / 60),
    );
    offer = {
      kind: "cadence",
      title: copy.cadenceTitle,
      body: copy.cadenceBody(subscription.intervalDays, formatMoney(yearlyDifference)),
      label: copy.cadenceAction,
      onAccept: () => {
        dispatch({ type: "setCadence", intervalDays: 60 });
        finishOffer(copy.cadenceDone, copy.cadenceDoneBody);
      },
    };
  } else if (
    reason === "otherProduct" &&
    subscription?.status === "active" &&
    availableProducts.length > 0
  ) {
    const product = availableProducts.find((item) => item.sku === productSku);
    offer = {
      kind: "swap",
      title: copy.swapTitle,
      body: copy.swapBody,
      label: copy.swapAction,
      fromSku,
      onFromChange: setFromSku,
      fromOptions: subscription.lines.map((line) => ({ value: line.sku, label: line.name })),
      productSku,
      onProductChange: setProductSku,
      productOptions: availableProducts.map((item) => ({ value: item.sku, label: item.name })),
      onAccept: () => {
        if (!product || !subscription.lines.some((line) => line.sku === fromSku)) return;
        dispatch({ type: "swapProduct", fromSku, product });
        finishOffer(copy.swapDone, copy.swapDoneBody);
      },
    };
  } else if (reason === "noResults") {
    offer =
      subscription?.status === "active"
        ? {
            kind: "support",
            title: copy.supportTitle,
            body: copy.supportBody,
            label: copy.pauseAction,
            supportLink: { href: subscriptionContent.support.href, label: copy.supportAction },
            onAccept: () => {
              setView("subscription");
              openPause();
            },
          }
        : {
            kind: "support",
            title: copy.supportTitle,
            body: copy.supportBodyPaused,
            supportLink: { href: subscriptionContent.support.href, label: copy.supportAction },
          };
  }
  const confirmCancel = () => {
    if (!cancellable) return;
    clearNotice();
    dispatch({ type: "cancel", now: new Date(), reason: reason || null });
    setView("subscription");
    notify({ tone: "success", title: copy.doneTitle, body: copy.doneBody });
  };
  return {
    view,
    open,
    h1Ref,
    confirm: {
      value: reason,
      options: REASONS.map((value) => ({ value, label: copy.reasons[value] })),
      onChange: setReason,
      offer,
      cancelLabel: copy.confirm,
      onCancel: confirmCancel,
      backLabel: copy.back,
      onBack: back,
    },
  };
}
