import { addDays } from "./dates";
import type { TPausePresetId } from "./pause.type";

export const PAUSE_PRESETS: ReadonlyArray<{ id: TPausePresetId; days: number | null }> = [
  { id: "1m", days: 30 },
  { id: "2m", days: 60 },
  { id: "3m", days: 90 },
  { id: "open", days: null },
];

export function pauseUntil(
  presetId: TPausePresetId,
  originalNextChargeAt: string | null,
  now: Date,
): string | null {
  const days = PAUSE_PRESETS.find(({ id }) => id === presetId)!.days;
  if (days === null) return null;
  const base =
    originalNextChargeAt && Date.parse(originalNextChargeAt) > now.getTime()
      ? originalNextChargeAt
      : now.toISOString();
  return addDays(base, days);
}

/** Tomorrow, or the subscription's original next charge when that is later. */
export function resumeChargeAt(now: Date, originalNextChargeAt: string | null): string {
  const tomorrow = addDays(now.toISOString(), 1);
  return originalNextChargeAt && Date.parse(originalNextChargeAt) > Date.parse(tomorrow)
    ? originalNextChargeAt
    : tomorrow;
}
