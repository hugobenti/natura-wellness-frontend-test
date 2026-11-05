import { addDays } from "./dates";
import type { TPausePresetId } from "./pause.type";

export const PAUSE_PRESETS: ReadonlyArray<{ id: TPausePresetId; days: number | null }> = [
  { id: "1m", days: 30 },
  { id: "2m", days: 60 },
  { id: "3m", days: 90 },
  { id: "open", days: null },
];

export function pauseUntil(presetId: TPausePresetId, now: Date): string | null {
  const days = PAUSE_PRESETS.find(({ id }) => id === presetId)!.days;
  return days === null ? null : addDays(now.toISOString(), days);
}

export function resumeChargeAt(now: Date): string {
  return addDays(now.toISOString(), 1);
}
