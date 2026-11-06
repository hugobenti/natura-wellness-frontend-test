import { fixtures } from "@/api/fixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deriveView, EMPTY_OVERLAY } from "../logic/subscriptionView";
import type { ILocalOverlay } from "../logic/subscriptionView.type";
import { useActivationFlow } from "./useActivationFlow";

const now = new Date("2026-11-05T12:00:00.000Z");

beforeEach(() => vi.useFakeTimers({ now }));
afterEach(() => vi.useRealTimers());

function setup(overlay: ILocalOverlay) {
  const view = deriveView(fixtures.active(), overlay);
  const dispatch = vi.fn();
  const notify = vi.fn();
  const hook = renderHook(() => useActivationFlow({ view, overlay, dispatch, notify }));
  return { dispatch, notify, ...hook };
}

describe("useActivationFlow", () => {
  it("confirms resuming on the preserved future charge date", () => {
    const overlay: ILocalOverlay = {
      ...EMPTY_OVERLAY,
      lifecycle: {
        status: "paused",
        pausedUntil: "2027-01-10T12:00:00.000Z",
        presetId: "1m",
        resumeAt: "2026-12-11T12:00:00.000Z",
      },
    };
    const { result, dispatch, notify } = setup(overlay);

    act(() => result.current.open());
    expect(result.current.dialog).toMatchObject({
      open: true,
      title: "Resume your subscription?",
      description: "Your next charge will be $101.87 on Fri, Dec 11.",
      confirmLabel: "Resume subscription",
      keepLabel: "Keep it paused",
    });
    expect(dispatch).not.toHaveBeenCalled();

    act(() => result.current.dialog.onConfirm());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "resume", now });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Subscription resumed",
      body: "Your next charge is $101.87 on Fri, Dec 11.",
    });
  });

  it("confirms reactivation with tomorrow as the next charge date", () => {
    const overlay: ILocalOverlay = {
      ...EMPTY_OVERLAY,
      lifecycle: { status: "cancelled", cancelledAt: "2026-11-01T12:00:00.000Z" },
    };
    const { result, dispatch, notify } = setup(overlay);

    act(() => result.current.open());
    expect(result.current.dialog).toMatchObject({
      open: true,
      title: "Reactivate your subscription?",
      description: "Your next charge will be $101.87 on Fri, Nov 6.",
      confirmLabel: "Reactivate subscription",
      keepLabel: "Keep it cancelled",
    });

    act(() => result.current.dialog.onConfirm());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "resume", now });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Subscription reactivated",
      body: "Your next charge is $101.87 on Fri, Nov 6.",
    });
  });
});
