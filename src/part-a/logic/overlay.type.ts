import type { IEditDraft } from "./editDraft.type";
import type { TPausePresetId } from "./pause.type";

export type TOverlayAction =
  | { type: "saveEdits"; draft: IEditDraft }
  | { type: "clearSkipped" }
  | { type: "pause"; presetId: TPausePresetId; now: Date }
  | { type: "resume"; now: Date }
  | { type: "skipLocally"; nextChargeAt: string; intervalDays: number };
