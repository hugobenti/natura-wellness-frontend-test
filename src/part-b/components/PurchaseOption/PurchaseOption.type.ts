import type { ReactNode } from "react";

export interface IPurchaseOptionProps {
  /** Shared `name` of the native radios. */
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: ReactNode;
  badge?: ReactNode;
  price: ReactNode;
  /** Shown inside the card only while it is selected. */
  children?: ReactNode;
}
