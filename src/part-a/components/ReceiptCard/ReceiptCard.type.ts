import type { SubscriptionStatus } from "@/api/types";
import type { Ref } from "react";

export interface IReceiptLineModel {
  sku: string;
  name: string;
  imageUrl: string | null;
  quantityLabel: string;
  priceCents: number | null;
  compareAtCents: number | null;
}

export type TReceiptFooter =
  | {
      kind: "charge";
      label: string;
      sublabel: string;
      totalCents: number;
      compareAtCents: number;
      savingLabel: string;
    }
  | { kind: "note"; label: string; sublabel: string | null };

export interface IReceiptCardProps {
  heading: string;
  status: SubscriptionStatus;
  lines: IReceiptLineModel[];
  footer: TReceiptFooter;
  headingRef?: Ref<HTMLHeadingElement>;
}
