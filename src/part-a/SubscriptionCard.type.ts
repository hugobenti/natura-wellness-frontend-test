import type { RefObject } from "react";
import type { IReceiptCardProps } from "./components/ReceiptCard/ReceiptCard.type";

export type TPageModel = { h1Ref: RefObject<HTMLHeadingElement | null> } & (
  | { kind: "loading" }
  | { kind: "error"; onRetry: () => void }
  | { kind: "ready"; receipt: IReceiptCardProps }
);
