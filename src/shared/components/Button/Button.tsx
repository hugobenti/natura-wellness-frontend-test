import { cx } from "@/shared/utils/cx";
import { button } from "./Button.style";
import type { IButtonProps } from "./Button.type";
import { useButton } from "./useButton";

/** The action control. `pending` ignores repeat activation but stays focusable. */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  pending,
  type = "button",
  className,
  children,
  onClick,
  ...rest
}: IButtonProps) {
  const behavior = useButton({ pending, onClick });

  return (
    <button
      {...rest}
      {...behavior}
      type={type}
      className={cx(
        button.base,
        button.variant[variant],
        button.size[size],
        fullWidth && button.fullWidth,
        className,
      )}
    >
      {pending && <span aria-hidden="true" className={button.spinner} />}
      {children}
    </button>
  );
}
