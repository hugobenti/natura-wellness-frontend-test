import { fixtures } from "@/api/fixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_OVERLAY, deriveView } from "../logic/subscriptionView";
import type { ILocalOverlay } from "../logic/subscriptionView.type";
import { usePauseFlow } from "./usePauseFlow";

const now = new Date("2026-11-05T12:00:00.000Z");

beforeEach(() => vi.useFakeTimers({ now }));
afterEach(() => vi.useRealTimers());

function setup(snapshot = fixtures.active(), overlay: ILocalOverlay = EMPTY_OVERLAY) {
  const view = deriveView(snapshot, overlay);
  const dispatch = vi.fn();
  const notify = vi.fn();
  const hook = renderHook(() =>
    usePauseFlow({ view, overlay, dispatch, notify, originalNextChargeAt: snapshot.nextChargeAt }),
  );
  return { view, dispatch, notify, ...hook };
}

describe("usePauseFlow", () => {
  it('openPause starts on 1 month and confirms "Pause for 1 month"', () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.openPause());
    expect(result.current.sheet).toMatchObject({
      open: true,
      value: "1m",
      confirmLabel: "Pause for 1 month",
      confirmDisabled: false,
      keepLabel: "Keep it active",
    });
    expect(result.current.sheet.options.map(({ description }) => description)).toEqual([
      "Next charge Sat, Dec 5",
      "Next charge Mon, Jan 4, 2027",
      "Next charge Wed, Feb 3, 2027",
      "No boxes or charges until you come back",
    ]);

    act(() => result.current.sheet.onConfirm());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "pause", presetId: "1m", now });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Subscription paused",
      body: "Paused until Sat, Dec 5.",
    });
    expect(result.current.sheet.open).toBe(false);
  });

  it("choosing Until I resume relabels the confirm", () => {
    const { result, dispatch, notify } = setup();
    act(() => result.current.openPause());
    act(() => result.current.sheet.onChange("open"));
    expect(result.current.sheet.confirmLabel).toBe("Pause until I resume");
    act(() => result.current.sheet.onConfirm());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "pause", presetId: "open", now });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Subscription paused",
      body: "Paused until you resume.",
    });
  });

  it("openChange on the server-paused fixture selects nothing and disables confirm", () => {
    const { result, dispatch } = setup(fixtures.paused());
    act(() => result.current.openChange());
    expect(result.current.sheet).toMatchObject({
      open: true,
      title: "Change your pause",
      value: "",
      confirmLabel: "Choose a duration",
      confirmDisabled: true,
      keepLabel: expect.stringMatching(/^Keep /),
    });
    act(() => result.current.sheet.onConfirm());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("openChange after a local pause starts from its preset", () => {
    const overlay: ILocalOverlay = {
      ...EMPTY_OVERLAY,
      lifecycle: { status: "paused", pausedUntil: "2027-01-04T12:00:00.000Z", presetId: "2m" },
    };
    const { result } = setup(fixtures.active(), overlay);
    act(() => result.current.openChange());
    expect(result.current.sheet).toMatchObject({
      value: "2m",
      confirmLabel: "Pause for 2 months",
      confirmDisabled: false,
      intro: "Currently paused until Mon, Jan 4, 2027.",
    });
  });

  it("resume dispatches resume and notifies with the next charge", () => {
    const { result, dispatch, notify } = setup(fixtures.paused());
    act(() => result.current.resume());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({
      type: "resume",
      now,
      originalNextChargeAt: null,
    });
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Subscription resumed",
      body: "Your next charge is $101.87 on Fri, Nov 6.",
    });
  });
});
