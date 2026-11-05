import { cx } from "@/shared/utils/cx";
import { iconPaths } from "./Icon.data";
import { icon } from "./Icon.style";
import type { IIconProps } from "./Icon.type";

/** A decorative stroke icon in `currentColor`. Pair it with a visible word; never the only signal. */
export function Icon({ name, className }: IIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cx(icon.base, className)}
    >
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
