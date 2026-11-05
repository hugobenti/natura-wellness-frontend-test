import type { SubscriptionStatus } from "@/api/types";
import type { IBoxPricing } from "./pricing.type";

export type TLifecycleOverride =
  | { status: "active"; nextChargeAt: string }
  | { status: "paused"; pausedUntil: string | null }
  | { status: "cancelled"; cancelledAt: string };

export interface ILocalOverlay {
  quantities: Readonly<Record<string, number>>;
  skippedSkus: readonly string[];
  lifecycle: TLifecycleOverride | null;
}

export interface IViewLine {
  sku: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  skipped: boolean;
  priceCents: number | null;
  compareAtCents: number | null;
}

export interface ISubscriptionView {
  id: string;
  updatedAt: string;
  status: SubscriptionStatus;
  nextChargeAt: string | null;
  pausedUntil: string | null;
  cancelledAt: string | null;
  intervalDays: number;
  discountPercent: number;
  lines: IViewLine[];
  pricing: IBoxPricing;
  skipIsLocal: boolean;
}
