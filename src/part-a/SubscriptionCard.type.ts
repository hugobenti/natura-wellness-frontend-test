import type { IReceiptCardProps } from "./components/ReceiptCard/ReceiptCard.type";

export type TPageModel =
  | { kind: "loading" }
  | { kind: "error"; onRetry: () => void }
  | { kind: "ready"; receipt: IReceiptCardProps };
