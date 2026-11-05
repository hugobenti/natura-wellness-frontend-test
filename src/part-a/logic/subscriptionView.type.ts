import type { SubscriptionStatus } from "@/api/types";
import type { IBoxPricing } from "./pricing.type";
import type { TPausePresetId } from "./pause.type";

type TLifecycleOverride =
  | { status: "active"; nextChargeAt: string }
  | {
      status: "paused";
      pausedUntil: string | null;
      presetId: TPausePresetId | null;
      /** The charge date to come back to; `null` when the server paused it. */
      resumeAt: string | null;
    }
  | { status: "cancelled"; cancelledAt: string };

export interface ILocalOverlay {
  quantities: Readonly<Record<string, number>>;
  skippedSkus: readonly string[];
  /** Skipped products whose quantity was stepped down to 0; shown as Qty 0 while skipped. */
  zeroSkus: readonly string[];
  lifecycle: TLifecycleOverride | null;
}

interface IViewLine {
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
