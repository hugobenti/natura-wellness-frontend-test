import type { ReactNode } from "react";

export interface IUseResponsiveDialogArgs {
  open: boolean;
  onClose: () => void;
}

export interface IResponsiveDialogProps extends IUseResponsiveDialogArgs {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}
