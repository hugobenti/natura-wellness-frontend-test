import { subscriptionContent } from "@/content/subscription";
import { Alert } from "@/shared/components/Alert/Alert";
import { Button } from "@/shared/components/Button/Button";
import { CancelConfirm } from "./components/CancelConfirm/CancelConfirm";
import { ManagePanel } from "./components/ManagePanel/ManagePanel";
import { PauseSheet } from "./components/PauseSheet/PauseSheet";
import { ReceiptCard } from "./components/ReceiptCard/ReceiptCard";
import { ReceiptSkeleton } from "./components/ReceiptSkeleton/ReceiptSkeleton";
import { SkipSheet } from "./components/SkipSheet/SkipSheet";
import { SupportLink } from "./components/SupportLink/SupportLink";
import { subscriptionCard } from "./SubscriptionCard.style";
import { useSubscriptionCard } from "./useSubscriptionCard";

export function SubscriptionCard() {
  const { h1Ref, ...model } = useSubscriptionCard();

  if (model.kind === "ready" && model.pageView === "cancelConfirm") {
    return (
      <CancelConfirm
        {...model.confirm}
        title={subscriptionContent.cancel.title}
        lead={subscriptionContent.cancel.lead}
        h1Ref={h1Ref}
      />
    );
  }

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
        <>
          <div className={subscriptionCard.ready}>
            <div>
              {model.notice && (
                <Alert
                  tone={model.notice.tone}
                  title={model.notice.title}
                  className={subscriptionCard.notice}
                  onDismiss={model.dismissNotice}
                >
                  <p>{model.notice.body}</p>
                </Alert>
              )}
              <ReceiptCard {...model.receipt} />
              {model.editHint && (
                <div className={subscriptionCard.editHint}>
                  <p>{model.editHint.text}</p>
                  <Button
                    variant="quiet"
                    className={subscriptionCard.editHintAction}
                    onClick={model.editHint.onCancel}
                  >
                    {model.editHint.cancelLabel}
                  </Button>
                </div>
              )}
            </div>
            {model.actions.length > 0 && (
              <ManagePanel>
                {model.actions.map((action) => (
                  <Button
                    key={action.key}
                    ref={action.ref}
                    variant={action.variant}
                    size="lg"
                    fullWidth
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </ManagePanel>
            )}
          </div>
          {model.skipSheet && <SkipSheet {...model.skipSheet} />}
          <PauseSheet {...model.pauseSheet} />
        </>
      )}
    </div>
  );
}
