import type { IEditDraft } from "./editDraft.type";
import type { TCancelReason } from "./cancelReason.type";
import type { TPausePresetId } from "./pause.type";

export type TOverlayAction =
  | { type: "saveEdits"; draft: IEditDraft }
  | { type: "clearSkipped" }
  | { type: "pause"; presetId: TPausePresetId; now: Date; resumeAt: string | null }
  | { type: "resume"; now: Date }
  | { type: "skipLocally"; nextChargeAt: string; intervalDays: number }
  | { type: "setCadence"; intervalDays: number }
  | { type: "cancel"; now: Date; reason: TCancelReason | null };
