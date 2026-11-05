import { subscriptionContent } from "@/content/subscription";
import { Alert } from "@/shared/components/Alert/Alert";
import { Button } from "@/shared/components/Button/Button";
import { ReceiptCard } from "./components/ReceiptCard/ReceiptCard";
import { ReceiptSkeleton } from "./components/ReceiptSkeleton/ReceiptSkeleton";
import { SupportLink } from "./components/SupportLink/SupportLink";
import { subscriptionCard } from "./SubscriptionCard.style";
import { useSubscriptionCard } from "./useSubscriptionCard";

export function SubscriptionCard() {
  const { h1Ref, ...model } = useSubscriptionCard();

  return (
    <div className={subscriptionCard.page}>
      <h1 ref={h1Ref} tabIndex={-1} className={subscriptionCard.title}>
        {subscriptionContent.title}
      </h1>
      {model.kind === "loading" && <ReceiptSkeleton />}
      {model.kind === "error" && (
        <Alert tone="danger" title={subscriptionContent.loadError.title}>
          <p>{subscriptionContent.loadError.body}</p>
          <div className={subscriptionCard.errorActions}>
            <Button variant="quiet" onClick={model.onRetry}>
              {subscriptionContent.loadError.retry}
            </Button>
            <SupportLink />
          </div>
        </Alert>
      )}
      {model.kind === "ready" && (
        <div className={subscriptionCard.ready}>
          <ReceiptCard {...model.receipt} />
        </div>
      )}
    </div>
  );
}
