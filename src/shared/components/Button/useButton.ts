import type { MouseEvent } from "react";
import type { IUseButtonArgs } from "./Button.type";

/** Guards a button against repeat activation while pending, without disabling it (it keeps focus). */
export function useButton({ pending, onClick }: IUseButtonArgs) {
  return {
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (pending) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    "aria-disabled": pending ? (true as const) : undefined,
    "aria-busy": pending ? (true as const) : undefined,
  };
}
