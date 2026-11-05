/** Joins class names, skipping empty parts: cx(card.base, interactive && card.interactive). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
