import type { ButtonHTMLAttributes, MouseEvent } from "react";
import type { button } from "./Button.style";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof button.variant;
  size?: keyof typeof button.size;
  fullWidth?: boolean;
  /** Shows a spinner and ignores clicks; the button stays focusable and keeps its label. */
  pending?: boolean;
}

export interface IUseButtonArgs {
  pending?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}
