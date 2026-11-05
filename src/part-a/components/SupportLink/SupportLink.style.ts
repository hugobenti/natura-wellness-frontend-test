import { button } from "@/shared/components/Button/Button.style";
import { cx } from "@/shared/utils/cx";

export const supportLink = {
  base: cx(button.base, button.variant.quiet, button.size.md),
} as const;
