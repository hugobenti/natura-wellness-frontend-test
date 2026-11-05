import type { IEditDraft } from "./editDraft.type";

export type TOverlayAction = { type: "saveEdits"; draft: IEditDraft } | { type: "clearSkipped" };
