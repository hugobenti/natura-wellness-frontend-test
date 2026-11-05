import { Icon } from "@/shared/icons/Icon";
import { cx } from "@/shared/utils/cx";
import { alert } from "./Alert.style";
import { alertIcon, alertRole } from "./Alert.data";
import type { IAlertProps } from "./Alert.type";

/** An inline message about an outcome, with an optional action. */
export function Alert({ tone, title, children, action, className }: IAlertProps) {
  return (
    <div role={alertRole[tone]} className={cx(alert.base, alert.tone[tone], className)}>
      <Icon name={alertIcon[tone]} className={alert.icon} />
      <div className={alert.body}>
        <p className={alert.title}>{title}</p>
        {children}
      </div>
      {action && <div className={alert.action}>{action}</div>}
    </div>
  );
}
