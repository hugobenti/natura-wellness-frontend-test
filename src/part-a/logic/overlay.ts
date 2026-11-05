import type { TOverlayAction } from "./overlay.type";
import type { ILocalOverlay } from "./subscriptionView.type";

export function overlayReducer(overlay: ILocalOverlay, action: TOverlayAction): ILocalOverlay {
  switch (action.type) {
    case "saveEdits":
      return {
        ...overlay,
        quantities: { ...action.draft.quantities },
        skippedSkus: [...action.draft.skippedSkus],
      };
    case "clearSkipped":
      return { ...overlay, skippedSkus: [] };
  }
}
