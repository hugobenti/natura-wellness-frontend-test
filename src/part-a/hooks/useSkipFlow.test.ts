import { fixtures } from "@/api/fixtures";
import { skipNextShipment } from "@/api/mockApi";
import { ApiError, type Subscription } from "@/api/types";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, formatDay } from "../logic/dates";
import { deriveView, EMPTY_OVERLAY } from "../logic/subscriptionView";
import { useSkipFlow } from "./useSkipFlow";

vi.mock("@/api/mockApi", () => ({ skipNextShipment: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => vi.mocked(skipNextShipment).mockReset());

function setup(successAmount?: (snapshot: Subscription) => number) {
  const snapshot = fixtures.active();
  const view = deriveView(snapshot, EMPTY_OVERLAY);
  const reload = vi.fn(async (): Promise<Subscription | null> => fixtures.active());
  const onSkipped = vi.fn();
  const notify = vi.fn();
  const hook = renderHook(() =>
    useSkipFlow({
      view,
      reload,
      onSkipped,
      notify,
      successAmount,
      skipLocally: vi.fn(),
      localSuccessAmount: () => view.pricing.totalCents,
    }),
  );
  act(() => hook.result.current.open());
  return { snapshot, view, reload, onSkipped, notify, ...hook };
}

describe("useSkipFlow", () => {
  it("success calls the API once with id and updatedAt, calls onSkipped, closes, and notifies success", async () => {
    const { snapshot, result, onSkipped, notify } = setup();
    const nextChargeAt = addDays(snapshot.nextChargeAt!, 30);
    const skipped = { ...snapshot, nextChargeAt };
    vi.mocked(skipNextShipment).mockResolvedValueOnce(skipped);

    await act(async () => result.current.confirm());

    expect(skipNextShipment).toHaveBeenCalledExactlyOnceWith({
      subscriptionId: snapshot.id,
      expectedUpdatedAt: snapshot.updatedAt,
    });
    expect(onSkipped).toHaveBeenCalledExactlyOnceWith(skipped);
    expect(result.current.phase).toBeNull();
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Next box skipped",
      body: expect.stringContaining(formatDay(nextChargeAt, new Date())),
    });
    expect(notify.mock.calls[0]?.[0].body).toContain("$101.87");
  });

  it("uses the committed overlay's total for the next box after a skip", async () => {
    const { result, notify } = setup(() => 14008);
    vi.mocked(skipNextShipment).mockResolvedValueOnce(fixtures.active());

    await act(async () => result.current.confirm());

    expect(notify.mock.calls[0]?.[0].body).toContain("$140.08");
  });

  it("confirm twice while pending calls the API once", async () => {
    const { result } = setup();
    const pending = deferred<Subscription>();
    vi.mocked(skipNextShipment).mockReturnValue(pending.promise);

    let first!: Promise<void>;
    act(() => {
      first = result.current.confirm();
      void result.current.confirm();
    });
    expect(result.current.phase).toBe("pending");
    expect(skipNextShipment).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve(fixtures.active()));
    await first;
  });

  it("close is ignored while pending", async () => {
    const { result } = setup();
    const pending = deferred<Subscription>();
    vi.mocked(skipNextShipment).mockReturnValue(pending.promise);

    let confirmation!: Promise<void>;
    act(() => {
      confirmation = result.current.confirm();
      result.current.close();
    });
    expect(result.current.phase).toBe("pending");
    await act(async () => pending.resolve(fixtures.active()));
    await confirmation;
    expect(result.current.phase).toBeNull();
  });

  it("409 reloads and moves to conflict", async () => {
    const { result, reload } = setup();
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(409, "changed"));

    await act(async () => result.current.confirm());

    expect(reload).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe("conflict");
  });

  it("409 with a failed reload moves to error", async () => {
    const { result, reload } = setup();
    reload.mockResolvedValueOnce(null);
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(409, "changed"));

    await act(async () => result.current.confirm());

    expect(result.current.phase).toBe("error");
  });

  it("409 whose reload is paused closes and notifies info", async () => {
    const { result, reload, notify } = setup();
    reload.mockResolvedValueOnce(fixtures.paused());
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(409, "changed"));

    await act(async () => result.current.confirm());

    expect(result.current.phase).toBeNull();
    expect(notify).toHaveBeenCalledWith({
      tone: "info",
      title: "Your subscription changed somewhere else",
      body: "We loaded the latest version.",
    });
  });

  it("400 behaves like 409", async () => {
    const { result, reload } = setup();
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(400, "not active"));

    await act(async () => result.current.confirm());

    expect(reload).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe("conflict");
  });

  it("500 moves to error; confirm again retries", async () => {
    const { result } = setup();
    vi.mocked(skipNextShipment)
      .mockRejectedValueOnce(new ApiError(500, "offline"))
      .mockResolvedValueOnce(fixtures.active());

    await act(async () => result.current.confirm());
    expect(result.current.phase).toBe("error");
    await act(async () => result.current.confirm());
    expect(skipNextShipment).toHaveBeenCalledTimes(2);
    expect(result.current.phase).toBeNull();
  });
  it("when view.skipIsLocal, confirm calls skipLocally, never the API, and notifies success", async () => {
    const nextChargeAt = "2026-11-06T12:00:00.000Z";
    const view = deriveView(fixtures.paused(), {
      ...EMPTY_OVERLAY,
      quantities: { "NW-MULTI-30": 3 },
      skippedSkus: ["NW-VITD-60"],
      lifecycle: { status: "active", nextChargeAt },
    });
    const skipLocally = vi.fn();
    const reload = vi.fn();
    const onSkipped = vi.fn();
    const notify = vi.fn();
    const { result } = renderHook(() =>
      useSkipFlow({
        view,
        reload,
        onSkipped,
        notify,
        skipLocally,
        localSuccessAmount: () => 14008,
      }),
    );
    act(() => result.current.open());

    await act(async () => result.current.confirm());

    expect(skipLocally).toHaveBeenCalledOnce();
    expect(skipNextShipment).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(onSkipped).not.toHaveBeenCalled();
    expect(result.current.phase).toBeNull();
    expect(notify).toHaveBeenCalledWith({
      tone: "success",
      title: "Next box skipped",
      body: expect.stringContaining("$140.08"),
    });
    expect(notify.mock.calls[0]?.[0].body).toContain(
      formatDay(addDays(nextChargeAt, 30), new Date()),
    );
  });
});
