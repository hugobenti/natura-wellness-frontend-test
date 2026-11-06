import { subscriptionContent } from "@/content/subscription";
import { Alert } from "@/shared/components/Alert/Alert";
import { Button } from "@/shared/components/Button/Button";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog/ResponsiveDialog";
import { SupportLink } from "../SupportLink/SupportLink";
import { skipSheet } from "./SkipSheet.style";
import type { ISkipSheetProps } from "./SkipSheet.type";

export function SkipSheet({
  open,
  phase,
  conflict,
  oldDate,
  newDate,
  amount,
  confirmLabel,
  chargeLabel,
  nothingNote,
  errorBody,
  onConfirm,
  onClose,
}: ISkipSheetProps) {
  const copy = subscriptionContent.skip;
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        <>
          <Button fullWidth pending={phase === "pending"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" fullWidth disabled={phase === "pending"} onClick={onClose}>
            {copy.keep}
          </Button>
        </>
      }
    >
      {phase === "conflict" && (
        <Alert tone="info" title={copy.conflictTitle} className={skipSheet.alert}>
          {conflict?.messages.length ? (
            <>
              <p>{copy.conflictBody}</p>
              <ul className={skipSheet.changes}>
                {conflict.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>{copy.conflictUnchanged}</p>
          )}
        </Alert>
      )}
      {phase === "error" && (
        <Alert tone="danger" title={copy.errorTitle} className={skipSheet.alert}>
          <p>{errorBody}</p>
          <div className={skipSheet.alertSupport}>
            <SupportLink />
          </div>
        </Alert>
      )}
      <dl className={skipSheet.facts}>
        <div className={skipSheet.fact}>
          <dt className={conflict?.nextDateChanged ? skipSheet.changedLabel : skipSheet.factLabel}>
            {copy.nextBox}
          </dt>
          <dd className={skipSheet.dates}>
            <span className={skipSheet.srOnly}>{copy.from}</span>
            <s className={conflict?.nextDateChanged ? skipSheet.changedOldDate : skipSheet.oldDate}>
              {oldDate}
            </s>
            <span aria-hidden="true">{copy.arrow}</span>
            <span className={skipSheet.srOnly}>{copy.to}</span>
            <strong
              className={conflict?.skipDateChanged ? skipSheet.changedValue : skipSheet.newDate}
            >
              {newDate}
            </strong>
          </dd>
        </div>
        <div className={skipSheet.fact}>
          <dt className={conflict?.skipDateChanged ? skipSheet.changedLabel : skipSheet.factLabel}>
            {chargeLabel}
          </dt>
          <dd className={conflict?.totalChanged ? skipSheet.changedValue : skipSheet.factValue}>
            {amount}
          </dd>
        </div>
      </dl>
      <p className={skipSheet.note}>{nothingNote}</p>
    </ResponsiveDialog>
  );
}
