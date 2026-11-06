import { useId } from "react";
import { cx } from "@/shared/utils/cx";
import { purchaseOption } from "./PurchaseOption.style";
import type { IPurchaseOptionProps } from "./PurchaseOption.type";

/** A native radio as a card: label, optional badge and price in the row, extras that expand while selected. */
export function PurchaseOption({
  name,
  checked,
  onSelect,
  label,
  badge,
  price,
  children,
}: IPurchaseOptionProps) {
  const inputId = useId();
  const look = checked ? purchaseOption.checked : purchaseOption.unchecked;

  return (
    <div className={cx(purchaseOption.frame, look.frame)}>
      <label htmlFor={inputId} className={cx(purchaseOption.row, look.row)}>
        <input
          id={inputId}
          type="radio"
          name={name}
          checked={checked}
          onChange={onSelect}
          className={purchaseOption.radio}
        />
        <span className={purchaseOption.text}>
          {label}
          {badge && <span className={purchaseOption.badge}>{badge}</span>}
        </span>
        <span className={purchaseOption.price}>{price}</span>
      </label>
      {children && (
        <div
          className={cx(
            purchaseOption.collapse,
            checked ? purchaseOption.expanded : purchaseOption.collapsed,
          )}
          inert={!checked}
        >
          <div className={purchaseOption.clip}>
            <div className={purchaseOption.extras}>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
