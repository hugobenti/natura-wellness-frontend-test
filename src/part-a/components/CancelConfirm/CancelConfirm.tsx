import { Button } from "@/shared/components/Button/Button";
import { Icon } from "@/shared/icons/Icon";
import { cancelConfirm } from "./CancelConfirm.style";
import type { ICancelConfirmViewProps } from "./CancelConfirm.type";

export function CancelConfirm({
  title,
  lead,
  h1Ref,
  reasons,
  editLink,
  keepLabel,
  onKeep,
  cancelLabel,
  onCancel,
  backLabel,
  onBack,
}: ICancelConfirmViewProps) {
  return (
    <div className={cancelConfirm.page}>
      <Button variant="quiet" className={cancelConfirm.back} onClick={onBack}>
        {backLabel}
      </Button>
      <h1 ref={h1Ref} tabIndex={-1} className={cancelConfirm.title}>
        {title}
      </h1>
      <p className={cancelConfirm.lead}>{lead}</p>
      <ul className={cancelConfirm.reasons}>
        {reasons.map(({ title: reasonTitle, body }, index) => (
          <li key={reasonTitle} className={cancelConfirm.reason}>
            <Icon name="check-circle" className={cancelConfirm.icon} />
            <div className={cancelConfirm.reasonText}>
              <h2 className={cancelConfirm.reasonTitle}>{reasonTitle}</h2>
              <p className={cancelConfirm.reasonBody}>{body}</p>
              {index === 0 && editLink && (
                <Button
                  variant="quiet"
                  className={cancelConfirm.editLink}
                  onClick={editLink.onClick}
                >
                  {editLink.label}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className={cancelConfirm.actions}>
        <Button size="lg" fullWidth onClick={onKeep}>
          {keepLabel}
        </Button>
        <Button variant="destructive" size="lg" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
