export interface IEditDraft {
  quantities: Record<string, number>;
  skippedSkus: string[];
  /** Skipped because the customer stepped the quantity down to 0; a subset of `skippedSkus`. */
  zeroSkus: string[];
  /** `null` keeps the server's delivery frequency. */
  intervalDays: number | null;
}
