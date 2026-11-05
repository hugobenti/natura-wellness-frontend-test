import { Icon } from "@/shared/icons/Icon";
import { cx } from "@/shared/utils/cx";
import { badge } from "./Badge.style";
import type { IBadgeProps } from "./Badge.type";

/** A short label in a highlight or status tone, optionally with an icon. */
export function Badge({ tone, icon, children, className }: IBadgeProps) {
  return (
    <span className={cx(badge.base, badge.tone[tone], className)}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
