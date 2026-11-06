import type { copy } from "../copy";

export type TPurchaseOption = "oneTime" | "subscribe";

/** The provided buy box copy; the logic reads its prices, default frequency and fine print. */
export type TBuyBoxCopy = typeof copy;
