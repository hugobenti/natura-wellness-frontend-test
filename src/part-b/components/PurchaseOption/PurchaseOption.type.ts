import type { ReactNode } from "react";

export interface IPurchaseOptionProps {
  /** Shared `name` of the native radios. */
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: ReactNode;
  badge?: ReactNode;
  price: ReactNode;
  /** Expands inside the card while it is selected; collapsed and inert otherwise. */
  children?: ReactNode;
}
