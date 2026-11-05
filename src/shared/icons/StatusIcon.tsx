import { cx } from "@/shared/utils/cx";
import { statusIconPaths } from "./StatusIcon.data";
import { statusIcon } from "./StatusIcon.style";
import type { IStatusIconProps } from "./StatusIcon.type";

/** A status's own shape. Always shown next to the status word; never the only signal. */
export function StatusIcon({ status, className }: IStatusIconProps) {
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
      className={cx(statusIcon.base, className)}
    >
      {statusIconPaths[status].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
