import { alertContent } from "@/content/components/alert";
import { Icon } from "@/shared/icons/Icon";
import { cx } from "@/shared/utils/cx";
import { Button } from "../Button/Button";
import { alert } from "./Alert.style";
import { alertIcon, alertRole } from "./Alert.data";
import type { IAlertProps } from "./Alert.type";

/** An inline message about an outcome, with an optional action and an optional close button. */
export function Alert({ tone, title, children, action, onDismiss, className }: IAlertProps) {
  return (
    <div
      role={alertRole[tone]}
      className={cx(
        alert.base,
        onDismiss ? alert.padding.dismissible : alert.padding.plain,
        alert.tone[tone],
        className,
      )}
    >
      <Icon name={alertIcon[tone]} className={alert.icon} />
      <div className={alert.body}>
        <p className={alert.title}>{title}</p>
        {children}
      </div>
      {action && <div className={alert.action}>{action}</div>}
      {onDismiss && (
        <Button
          variant="quiet"
          size="icon"
          aria-label={alertContent.dismissLabel}
          className={alert.dismiss}
          onClick={onDismiss}
        >
          <Icon name="close" />
        </Button>
      )}
    </div>
  );
}
