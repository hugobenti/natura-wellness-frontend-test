import { subscriptionContent } from "@/content/subscription";
import { Button } from "@/shared/components/Button/Button";
import { FormField } from "@/shared/components/FormField/FormField";
import { useFormField } from "@/shared/components/FormField/useFormField";
import { RadioGroup } from "@/shared/components/RadioGroup/RadioGroup";
import { Icon } from "@/shared/icons/Icon";
import type { TCancelReason } from "../../logic/cancelReason.type";
import { cancelConfirm } from "./CancelConfirm.style";
import type { ICancelConfirmViewProps } from "./CancelConfirm.type";

export function CancelConfirm({
  title,
  lead,
  h1Ref,
  value,
  options,
  onChange,
  note,
  onNoteChange,
  offer,
  cancelLabel,
  onCancel,
  backLabel,
  onBack,
}: ICancelConfirmViewProps) {
  const copy = subscriptionContent.cancel;
  const noteField = useFormField({ hint: copy.otherNoteHint });
  const reasonOptions = options.map((option) =>
    option.value === "other"
      ? {
          ...option,
          panel: (
            <FormField
              field={noteField}
              label={copy.otherNoteLabel}
              hint={copy.otherNoteHint}
              className={cancelConfirm.note}
            >
              <textarea
                id={noteField.controlId}
                aria-describedby={noteField.describedBy}
                aria-invalid={noteField.invalid}
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                className={cancelConfirm.noteControl}
              />
            </FormField>
          ),
        }
      : option,
  );
  return (
    <div className={cancelConfirm.page}>
      <Button variant="quiet" className={cancelConfirm.back} onClick={onBack}>
        <Icon name="arrow-left" />
        {backLabel}
      </Button>
      <h1 ref={h1Ref} tabIndex={-1} className={cancelConfirm.title}>
        {title}
      </h1>
      <p className={cancelConfirm.lead}>{lead}</p>
      <RadioGroup<TCancelReason | "">
        legend={subscriptionContent.cancel.legend}
        name="cancel-reason"
        appearance="list"
        value={value}
        options={reasonOptions}
        onChange={(choice) => choice && onChange(choice)}
        className={cancelConfirm.reasons}
      />
      <div aria-live="polite" aria-atomic="true">
        {offer && (
          <section className={cancelConfirm.offer}>
            <h2 className={cancelConfirm.offerTitle}>{offer.title}</h2>
            <p className={cancelConfirm.offerBody}>{offer.body}</p>
            {offer.supportLink && (
              <a className={cancelConfirm.supportLink} href={offer.supportLink.href}>
                {offer.supportLink.label}
              </a>
            )}
            {offer.label && offer.onAccept && (
              <Button
                size="lg"
                fullWidth
                onClick={offer.onAccept}
                className={cancelConfirm.offerAction}
              >
                {offer.label}
              </Button>
            )}
          </section>
        )}
      </div>
      <div className={cancelConfirm.actions}>
        <Button variant="destructive" size="lg" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
