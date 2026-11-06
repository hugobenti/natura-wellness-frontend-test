import type { IEditDraft } from "./editDraft.type";
import type { CatalogProduct } from "@/api/types";
import type { TCancelReason } from "../components/CancelConfirm/CancelConfirm.type";
import type { TPausePresetId } from "./pause.type";

export type TOverlayAction =
  | { type: "saveEdits"; draft: IEditDraft }
  | { type: "clearSkipped" }
  | { type: "pause"; presetId: TPausePresetId; now: Date; resumeAt: string | null }
  | { type: "resume"; now: Date }
  | { type: "skipLocally"; nextChargeAt: string; intervalDays: number }
  | { type: "setCadence"; intervalDays: number }
  | { type: "swapProduct"; fromSku: string; product: CatalogProduct }
  | { type: "cancel"; now: Date; reason: TCancelReason | null };
