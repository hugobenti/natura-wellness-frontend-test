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
  const startEdit = vi.fn();
  const hook = renderHook(() => useCancelFlow({ subscription, dispatch, notify, startEdit }));
  return { dispatch, notify, startEdit, ...hook };
}

describe("useCancelFlow", () => {
  it("cancel takes two calls", () => {
    const { result, dispatch } = setup();
    expect(result.current.view).toBe("subscription");
    act(() => result.current.open());
    expect(result.current.view).toBe("cancelConfirm");
    expect(dispatch).not.toHaveBeenCalled();

    act(() => result.current.confirmCancel());
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "cancel", now });
    expect(result.current.view).toBe("survey");
  });

  it("keep and back return unchanged", () => {
    const { result, dispatch } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.onKeep());
    expect(result.current.view).toBe("subscription");
    act(() => result.current.open());
    act(() => result.current.confirm.onBack());
    expect(result.current.view).toBe("subscription");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("edit my next box returns in edit mode", () => {
    const { result, dispatch, startEdit } = setup();
    act(() => result.current.open());
    act(() => result.current.confirm.editLink!.onClick());
    expect(result.current.view).toBe("subscription");
    expect(startEdit).toHaveBeenCalledOnce();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("the edit link exists only while active", () => {
    expect(setup().result.current.confirm.editLink).not.toBeNull();
    expect(setup(fixtures.paused()).result.current.confirm.editLink).toBeNull();
  });

  it("survey is optional", () => {
    const skipped = setup();
    act(() => skipped.result.current.open());
    act(() => skipped.result.current.confirmCancel());
    expect(skipped.result.current.survey.sendDisabled).toBe(true);
    act(() => skipped.result.current.survey.onSkip());
    expect(skipped.result.current.view).toBe("subscription");
    expect(skipped.notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Your subscription is cancelled",
      body: "You won't be charged again.",
    });

    const sent = setup();
    act(() => sent.result.current.open());
    act(() => sent.result.current.confirmCancel());
    act(() => sent.result.current.survey.onChange("cost"));
    expect(sent.result.current.survey.sendDisabled).toBe(false);
    act(() => sent.result.current.survey.onSend());
    expect(sent.result.current.view).toBe("subscription");
    expect(sent.notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Your subscription is cancelled",
      body: "Thanks for telling us why.",
    });
  });

  it("the first reason does not offer skipping while paused", () => {
    const active = setup().result.current.confirm.reasons[0]!;
    const paused = setup(fixtures.paused()).result.current.confirm.reasons[0]!;
    expect(paused.title).toBe(active.title);
    expect(paused.body).not.toBe(active.body);
    expect(paused.body).toContain("stay paused");
  });
});
