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
          <Button variant="secondary" fullWidth onClick={onClose}>
            {copy.keep}
          </Button>
        </>
      }
    >
      <dl className={skipSheet.facts}>
        <div className={skipSheet.fact}>
          <dt className={skipSheet.factLabel}>{copy.nextBox}</dt>
          <dd className={skipSheet.dates}>
            <s className={skipSheet.oldDate}>{oldDate}</s>
            <span aria-hidden="true">{copy.arrow}</span>
            <strong className={skipSheet.newDate}>{newDate}</strong>
          </dd>
        </div>
        <div className={skipSheet.fact}>
          <dt className={skipSheet.factLabel}>{chargeLabel}</dt>
          <dd className={skipSheet.factValue}>{amount}</dd>
        </div>
      </dl>
      <p className={skipSheet.note}>{nothingNote}</p>
      {phase === "conflict" && (
        <Alert tone="info" title={copy.conflictTitle} className={skipSheet.alert}>
          <p>{copy.conflictBody}</p>
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
    </ResponsiveDialog>
  );
}
