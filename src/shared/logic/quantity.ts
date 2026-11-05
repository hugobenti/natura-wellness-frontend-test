/** Clamps `value` into `[min, max]` and truncates it to an integer. */
export function clampQuantity(value: number, min: number, max: number): number {
  return Math.trunc(Math.min(Math.max(value, min), max));
}
