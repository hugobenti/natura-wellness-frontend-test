import { addDays } from "./dates";
import { pauseUntil, resumeChargeAt } from "./pause";
import type { TOverlayAction } from "./overlay.type";
import type { ILocalOverlay } from "./subscriptionView.type";

export function overlayReducer(overlay: ILocalOverlay, action: TOverlayAction): ILocalOverlay {
  switch (action.type) {
    case "saveEdits":
      return {
        ...overlay,
        quantities: { ...action.draft.quantities },
        skippedSkus: [...action.draft.skippedSkus],
        zeroSkus: [...action.draft.zeroSkus],
      };
    case "clearSkipped":
      return { ...overlay, skippedSkus: [], zeroSkus: [] };
    case "pause":
      return {
        ...overlay,
        skippedSkus: [],
        zeroSkus: [],
        lifecycle: {
          status: "paused",
          pausedUntil: pauseUntil(action.presetId, action.now),
          presetId: action.presetId,
          resumeAt: action.resumeAt,
        },
      };
    case "resume":
      return {
        ...overlay,
        lifecycle: {
          status: "active",
          nextChargeAt: resumeChargeAt(
            action.now,
            overlay.lifecycle?.status === "paused" ? overlay.lifecycle.resumeAt : null,
          ),
        },
      };
    case "skipLocally":
      return {
        ...overlay,
        skippedSkus: [],
        zeroSkus: [],
        lifecycle: {
          status: "active",
          nextChargeAt: addDays(action.nextChargeAt, action.intervalDays),
        },
      };
    case "cancel":
      return {
        ...overlay,
        skippedSkus: [],
        lifecycle: { status: "cancelled", cancelledAt: action.now.toISOString() },
      };
  }
}
