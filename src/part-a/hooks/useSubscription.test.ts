import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import type { Subscription } from "@/api/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscription } from "./useSubscription";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
});

describe("useSubscription", () => {
  it("loads into ready", async () => {
    const snapshot = fixtures.active();
    vi.mocked(getSubscription).mockResolvedValue(snapshot);
    const { result } = renderHook(useSubscription);

    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state).toEqual({ status: "ready", snapshot }));
  });

  it("a rejected load is error, and retry goes loading → ready", async () => {
    const snapshot = fixtures.active();
    const retryRequest = deferred<Subscription>();
    vi.mocked(getSubscription)
      .mockRejectedValueOnce(new Error("offline"))
      .mockReturnValueOnce(retryRequest.promise);
    const { result } = renderHook(useSubscription);

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    act(() => result.current.retry());
    expect(result.current.state.status).toBe("loading");
    await act(async () => retryRequest.resolve(snapshot));
    expect(result.current.state).toEqual({ status: "ready", snapshot });
  });

  it("reload while ready keeps ready and resolves the fresh snapshot", async () => {
    const original = fixtures.active();
    const fresh = { ...original, updatedAt: "2026-11-12T12:00:00.000Z" };
    const reloadRequest = deferred<Subscription>();
    vi.mocked(getSubscription)
      .mockResolvedValueOnce(original)
      .mockReturnValueOnce(reloadRequest.promise);
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    let reload!: Promise<Subscription | null>;
    act(() => {
      reload = result.current.reload();
    });
    expect(result.current.state).toEqual({ status: "ready", snapshot: original });
    await act(async () => reloadRequest.resolve(fresh));
    expect(await reload).toEqual(fresh);
    expect(result.current.state).toEqual({ status: "ready", snapshot: fresh });
  });

  it("failed reload resolves null and keeps the old snapshot", async () => {
    const original = fixtures.active();
    vi.mocked(getSubscription)
      .mockResolvedValueOnce(original)
      .mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    let reloaded!: Subscription | null;
    await act(async () => {
      reloaded = await result.current.reload();
    });
    expect(reloaded).toBeNull();
    expect(result.current.state).toEqual({ status: "ready", snapshot: original });
  });

  it("replace installs the subscription returned by a successful skip", async () => {
    const original = fixtures.active();
    const replaced = { ...original, updatedAt: "2026-11-12T12:00:00.000Z" };
    vi.mocked(getSubscription).mockResolvedValue(original);
    const { result } = renderHook(useSubscription);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    act(() => result.current.replace(replaced));
    expect(result.current.state).toEqual({ status: "ready", snapshot: replaced });
  });

  it("stale response is ignored", async () => {
    const first = deferred<Subscription>();
    const second = deferred<Subscription>();
    const newer = fixtures.active();
    const older = { ...newer, updatedAt: "2026-10-01T12:00:00.000Z" };
    vi.mocked(getSubscription)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result } = renderHook(useSubscription);

    act(() => result.current.retry());
    await act(async () => second.resolve(newer));
    expect(result.current.state).toEqual({ status: "ready", snapshot: newer });
    await act(async () => first.resolve(older));
    expect(result.current.state).toEqual({ status: "ready", snapshot: newer });
  });
});
