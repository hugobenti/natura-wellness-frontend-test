import { fixtures } from "@/api/fixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_OVERLAY, deriveView } from "../logic/subscriptionView";
import { useCancelFlow } from "./useCancelFlow";

const now = new Date("2026-11-05T12:00:00.000Z");
beforeEach(() => {
  vi.useFakeTimers({ now });
  window.scrollTo = vi.fn();
});
afterEach(() => vi.useRealTimers());

function setup(snapshot = fixtures.active()) {
  const subscription = deriveView(snapshot, EMPTY_OVERLAY);
  const dispatch = vi.fn();
  const notify = vi.fn();
  const openSkip = vi.fn();
  const openPause = vi.fn();
  const hook = renderHook(() =>
    useCancelFlow({ subscription, dispatch, notify, clearNotice: vi.fn(), openSkip, openPause }),
  );
  return { ...hook, dispatch, notify, openSkip, openPause };
}

describe("useCancelFlow", () => {
  it("cancels without a reason and returns immediately to the cancelled receipt", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onCancel());
    expect(dispatch).toHaveBeenCalledWith({ type: "cancel", now, reason: null });
    expect(result.current.view).toBe("subscription");
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ body: "You won't be charged again." }),
    );
  });
  it.each(["tooMuch", "cost", "otherProduct", "noResults", "other"] as const)(
    "maps %s to its matched offer",
    (reason) => {
      const { result } = setup();
      act(() => result.current.open());
      act(() => result.current.confirm.onChange(reason));
      expect(result.current.confirm.offer?.kind ?? null).toBe(
        {
          tooMuch: "skip",
          cost: "cadence",
          otherProduct: "browse",
          noResults: "support",
          other: null,
        }[reason],
      );
    },
  );
  it("hands off the skip offer to the existing skip sheet", () => {
    const { result, openSkip } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("tooMuch"));
    act(() => result.current.confirm.offer!.onAccept!());
    expect(openSkip).toHaveBeenCalledOnce();
    expect(result.current.view).toBe("subscription");
  });
  it("changes cadence locally and reports annual difference", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("cost"));
    expect(result.current.confirm.offer!.body).toContain("$619.71");
    act(() => result.current.confirm.offer!.onAccept!());
    expect(dispatch).toHaveBeenCalledWith({ type: "setCadence", intervalDays: 60 });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });
  it("does not repeat the cadence offer after switching to 60 days", () => {
    const changed = deriveView(fixtures.active(), { ...EMPTY_OVERLAY, intervalDays: 60 });
    const dispatch = vi.fn();
    const { result } = renderHook(() =>
      useCancelFlow({
        subscription: changed,
        dispatch,
        notify: vi.fn(),
        clearNotice: vi.fn(),
        openSkip: vi.fn(),
        openPause: vi.fn(),
      }),
    );
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("cost"));
    expect(result.current.confirm.offer).toBeNull();
  });
  it("shows a product-list action for the different-product reason", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("otherProduct"));
    const offer = result.current.confirm.offer!;
    expect(offer).toMatchObject({
      kind: "browse",
      title: "Try a different product",
      body: "The product list isn't available here yet.",
      label: "Browse products",
    });
    act(() => offer.onAccept!());
    expect(result.current.view).toBe("cancelConfirm");
    expect(dispatch).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
  it("hands the no-results alternative to the existing pause flow", () => {
    const { result, openPause } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("noResults"));
    act(() => result.current.confirm.offer!.onAccept!());
    expect(openPause).toHaveBeenCalledOnce();
  });
  it("shows support alone for no results while already paused", () => {
    const { result, openPause } = setup(fixtures.paused());
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("noResults"));
    expect(result.current.confirm.offer).toMatchObject({
      kind: "support",
      title: "We're here to listen",
      body: "Talk to our team whenever you're ready.",
      supportLink: expect.objectContaining({ label: "Talk to our team" }),
    });
    expect(result.current.confirm.offer?.label).toBeUndefined();
    expect(result.current.confirm.offer?.onAccept).toBeUndefined();
    expect(openPause).not.toHaveBeenCalled();
  });
  it("does not offer skip or pause on a paused subscription", () => {
    const { result } = setup(fixtures.paused());
    act(() => result.current.open());
    act(() => result.current.confirm.onChange("tooMuch"));
    expect(result.current.confirm.offer).toBeNull();
    act(() => result.current.confirm.onCancel());
    expect(result.current.view).toBe("subscription");
  });
});
