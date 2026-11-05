/** First letter of the first word, uppercased; `""` for blank input. */
export function initialOf(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : "";
}
