import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscriptionCard } from "./useSubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn(), skipNextShipment: vi.fn() }));

beforeEach(() => vi.mocked(getSubscription).mockReset());

describe("useSubscriptionCard edit mode with every product excluded", () => {
  it("every product at 0 disables Save and shows the stop-all hint", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    for (const sku of ["NW-VITD-60", "NW-MULTI-30"]) {
      act(
        () =>
          result.current.kind === "ready" &&
          result.current.receipt.lines.find((line) => line.sku === sku)?.edit?.onQuantityChange(0),
      );
    }
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.actions.find(({ key }) => key === "save")?.disabled).toBe(true);
    expect(result.current.editHint).not.toBeNull();
    expect(result.current.receipt.lines[0]?.edit).toMatchObject({ quantity: 0 });
    expect(result.current.receipt.footer).toMatchObject({ kind: "draft", savingLabel: null });
  });

  it("saving with every product skipped once opens the skip sheet", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.skip?.onClick(),
    );
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    const save = result.current.actions.find(({ key }) => key === "save");
    expect(save?.disabled).toBeFalsy();
    expect(result.current.editHint).toBeNull();
    act(() => save?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.skipSheet?.phase).toBe("confirm");
    expect(result.current.skipSheet?.open).toBe(true);
    expect(result.current.receipt.heading).toBe("Next box");
  });

  it("one product skipped once and the other at 0 is an empty box: Save disabled and the hint shown", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.onQuantityChange(0),
    );
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.actions.find(({ key }) => key === "save")?.disabled).toBe(true);
    expect(result.current.editHint).not.toBeNull();
  });

  it("a product saved at 0 reads Qty 0 and returns to edit mode at 0; a skipped-once product keeps its quantity", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.onQuantityChange(0),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")).toMatchObject({
      quantityLabel: "Qty 0",
      skippedNote: "Skipped in the next box only",
    });
    expect(result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")).toMatchObject({
      quantityLabel: "Qty 1",
    });

    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")?.edit?.quantity,
    ).toBe(0);
  });

  it("a product skipped once keeps its real quantity after save", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.skip?.onClick(),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")).toMatchObject({
      quantityLabel: "Qty 2",
      skippedNote: "Skipped in the next box only",
    });
  });
});
