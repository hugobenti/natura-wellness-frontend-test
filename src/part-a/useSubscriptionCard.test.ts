import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import type { Subscription } from "@/api/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscriptionCard } from "./useSubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
});

describe("useSubscriptionCard", () => {
  it("active maps to the receipt at a glance", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);

    await waitFor(() => expect(result.current.kind).toBe("ready"));
    expect(result.current).toMatchObject({
      kind: "ready",
      receipt: {
        heading: "Next box",
        status: "active",
        lines: [{ quantityLabel: "Qty 1" }, { quantityLabel: "Qty 2" }],
        footer: {
          kind: "charge",
          totalCents: 10187,
          compareAtCents: 11985,
          savingLabel: "You save $17.98",
        },
      },
    });
  });

  it("paused maps to a note", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.paused());
    const { result } = renderHook(useSubscriptionCard);

    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.heading).toMatch(/^Paused until/);
    expect(result.current.receipt.footer).toMatchObject({
      kind: "note",
      label: "No charges while paused",
    });
  });

  it("cancelled maps to a note without a total", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.cancelled());
    const { result } = renderHook(useSubscriptionCard);

    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.heading).toMatch(/^Cancelled on/);
    expect(result.current.receipt.footer).toEqual({
      kind: "note",
      label: "No more charges",
      sublabel: null,
    });
  });

  it("load error maps to error, and onRetry goes back to loading", async () => {
    let resolveRetry!: (snapshot: Subscription) => void;
    const retryRequest = new Promise<Subscription>((resolve) => {
      resolveRetry = resolve;
    });
    vi.mocked(getSubscription)
      .mockRejectedValueOnce(new Error("offline"))
      .mockReturnValueOnce(retryRequest);
    const { result } = renderHook(useSubscriptionCard);

    await waitFor(() => expect(result.current.kind).toBe("error"));
    if (result.current.kind !== "error") throw new Error("Expected a load error");
    act(() => result.current.kind === "error" && result.current.onRetry());
    expect(result.current.kind).toBe("loading");
    await act(async () => resolveRetry(fixtures.active()));
    expect(result.current.kind).toBe("ready");
  });
});
