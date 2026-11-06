import { fixtures } from "@/api/fixtures";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_OVERLAY } from "../logic/subscriptionView";
import { useEditMode } from "./useEditMode";

function setup() {
  const snapshot = fixtures.active();
  const dispatch = vi.fn();
  const notify = vi.fn();
  const hook = renderHook(() =>
    useEditMode({ overlay: EMPTY_OVERLAY, snapshot, dispatch, notify }),
  );
  return { snapshot, dispatch, notify, ...hook };
}

describe("useEditMode", () => {
  it("start opens a draft of the committed overlay", () => {
    const { result } = setup();
    act(() => result.current.start());
    expect(result.current.editing).toBe(true);
    expect(result.current.draftView?.pricing.totalCents).toBe(10187);
  });

  it("setQuantity updates the draft total live without committing", () => {
    const { result, dispatch } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-MULTI-30", 3));
    expect(result.current.draftView?.pricing.totalCents).toBe(14008);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("save dispatches saveEdits and notifies Changes saved", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-MULTI-30", 3));
    act(() => result.current.save());
    expect(result.current.editing).toBe(false);
    expect(dispatch).toHaveBeenCalledWith({
      type: "saveEdits",
      draft: {
        quantities: { "NW-MULTI-30": 3 },
        skippedSkus: [],
        zeroSkus: [],
        intervalDays: null,
      },
    });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Changes saved",
      body: expect.stringContaining("$140.08"),
    });
  });

  it("cancel discards the draft without dispatching", () => {
    const { result, dispatch } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-MULTI-30", 3));
    act(() => result.current.cancel());
    expect(result.current.editing).toBe(false);
    expect(result.current.draftView).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("toggleSkip excludes a product and toggling again restores it", () => {
    const { result } = setup();
    act(() => result.current.start());
    act(() => result.current.toggleSkip("NW-VITD-60"));
    expect(result.current.draftView?.lines.find((line) => line.sku === "NW-VITD-60")).toMatchObject(
      {
        skipped: true,
        priceCents: null,
      },
    );
    expect(result.current.draftView?.pricing.totalCents).toBe(7642);
    act(() => result.current.toggleSkip("NW-VITD-60"));
    expect(result.current.draftView?.pricing.totalCents).toBe(10187);
  });

  it("the last product can be skipped", () => {
    const { result } = setup();
    act(() => result.current.start());
    act(() => result.current.toggleSkip("NW-VITD-60"));
    act(() => result.current.toggleSkip("NW-MULTI-30"));
    expect(result.current.draftView?.lines.map(({ skipped }) => skipped)).toEqual([true, true]);
    expect(result.current.allExcluded).toBe(true);
    expect(result.current.emptyBox).toBe(false);
  });

  it("stepping a product to 0 excludes it from the draft total and keeps its future quantity after save", () => {
    const { result, dispatch } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-MULTI-30", 3));
    act(() => result.current.setQuantity("NW-MULTI-30", 0));
    expect(result.current.isZero("NW-MULTI-30")).toBe(true);
    expect(result.current.draftView?.pricing.totalCents).toBe(2546);
    act(() => result.current.save());
    expect(dispatch).toHaveBeenCalledWith({
      type: "saveEdits",
      draft: expect.objectContaining({
        quantities: { "NW-MULTI-30": 3 },
        skippedSkus: ["NW-MULTI-30"],
      }),
    });
  });

  it("an empty box needs every product excluded and one at 0", () => {
    const { result } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-VITD-60", 0));
    expect(result.current.emptyBox).toBe(false);
    act(() => result.current.setQuantity("NW-MULTI-30", 0));
    expect(result.current.emptyBox).toBe(true);
    expect(result.current.allExcluded).toBe(true);
  });

  it("saving with every product excluded commits quantities, drops the draft skips and reports a whole-box skip", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.start());
    act(() => result.current.setQuantity("NW-MULTI-30", 3));
    act(() => result.current.toggleSkip("NW-VITD-60"));
    act(() => result.current.toggleSkip("NW-MULTI-30"));
    let wholeBox = false;
    act(() => {
      wholeBox = result.current.save();
    });
    expect(wholeBox).toBe(true);
    expect(result.current.editing).toBe(false);
    expect(dispatch).toHaveBeenCalledWith({
      type: "saveEdits",
      draft: expect.objectContaining({ quantities: { "NW-MULTI-30": 3 }, skippedSkus: [] }),
    });
    expect(notify).not.toHaveBeenCalled();
  });
});
