import type { SubscriptionStatus } from "@/api/types";
import type { Ref } from "react";

interface IReceiptLineEdit {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  stepperLabel: string;
  skip: { label: string; onClick: () => void } | null;
  undo: { label: string; onClick: () => void } | null;
  skippedNote: string | null;
  /** Shown under the name while the quantity is stepped down to 0. */
  zeroNote: string | null;
}

export interface IReceiptLineModel {
  sku: string;
  name: string;
  imageUrl: string | null;
  quantityLabel: string;
  priceCents: number | null;
  compareAtCents: number | null;
  skippedNote?: string | null;
  edit?: IReceiptLineEdit;
}

export type TReceiptFooter =
  | {
      kind: "charge";
      label: string;
      sublabel: string;
      totalCents: number;
      compareAtCents: number;
      savingLabel: string | null;
    }
  | { kind: "note"; label: string; sublabel: string | null }
  | {
      kind: "draft";
      label: string;
      sublabel: string;
      totalCents: number;
      compareAtCents: number;
      savingLabel: string | null;
    };

export interface IReceiptCardProps {
  heading: string;
  status: SubscriptionStatus;
  lines: IReceiptLineModel[];
  footer: TReceiptFooter;
  headingRef?: Ref<HTMLHeadingElement>;
}
