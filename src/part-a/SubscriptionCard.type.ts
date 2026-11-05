import type { Ref, RefObject } from "react";
import type { INotice } from "./hooks/notice.type";
import type { ISkipSheetProps } from "./components/SkipSheet/SkipSheet.type";
import type { IReceiptCardProps } from "./components/ReceiptCard/ReceiptCard.type";

export interface IManageAction {
  key: string;
  label: string;
  variant: "primary" | "secondary" | "quiet";
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export type TPageModel = { h1Ref: RefObject<HTMLHeadingElement | null> } & (
  | { kind: "loading" }
  | { kind: "error"; onRetry: () => void }
  | {
      kind: "ready";
      receipt: IReceiptCardProps;
      notice: INotice | null;
      skipSheet: ISkipSheetProps | null;
      actions: IManageAction[];
    }
);
