const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats an amount in cents as US dollars, e.g. `2546` → `"$25.46"`. */
export function formatMoney(cents: number): string {
  return usd.format(cents / 100);
}
