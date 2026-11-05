export interface IPricedLine {
  sku: string;
  priceCents: number;
  compareAtCents: number;
}

export interface IBoxPricing {
  lines: IPricedLine[];
  subtotalCents: number;
  totalCents: number;
  savingCents: number;
}
