import { subscriptionContent } from "@/content/subscription";
import { Button } from "@/shared/components/Button/Button";
import type { TCancelReason } from "../../logic/cancelReason.type";
import { RadioGroup } from "@/shared/components/RadioGroup/RadioGroup";
import { Icon } from "@/shared/icons/Icon";
import { cancelConfirm } from "./CancelConfirm.style";
import type { ICancelConfirmViewProps } from "./CancelConfirm.type";
export function CancelConfirm({
  title,
  lead,
  h1Ref,
  value,
  options,
  onChange,
  offer,
  cancelLabel,
  onCancel,
  backLabel,
  onBack,
}: ICancelConfirmViewProps) {
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
        options={options}
        onChange={(choice) => choice && onChange(choice)}
        className={cancelConfirm.reasons}
      />
      <div aria-live="polite" aria-atomic="true">
        {offer && (
          <section className={cancelConfirm.offer}>
            <h2 className={cancelConfirm.offerTitle}>{offer.title}</h2>
            <p className={cancelConfirm.offerBody}>{offer.body}</p>
            {offer.fromOptions && offer.onFromChange && offer.fromSku && (
              <RadioGroup
                legend={subscriptionContent.cancel.fromLegend}
                name="swap-from"
                value={offer.fromSku}
                options={offer.fromOptions}
                onChange={offer.onFromChange}
                appearance="list"
                className={cancelConfirm.swapOptions}
              />
            )}
            {offer.productOptions && offer.onProductChange && offer.productSku && (
              <RadioGroup
                legend={subscriptionContent.cancel.productLegend}
                name="swap-to"
                value={offer.productSku}
                options={offer.productOptions}
                onChange={offer.onProductChange}
                appearance="list"
                className={cancelConfirm.swapOptions}
              />
            )}
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
