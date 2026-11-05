import { fixtures } from "@/api/fixtures";
import { getSubscription, skipNextShipment } from "@/api/mockApi";
import { ApiError, type Subscription } from "@/api/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, formatDay } from "./logic/dates";
import { useSubscriptionCard } from "./useSubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn(), skipNextShipment: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
  vi.mocked(skipNextShipment).mockReset();
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
  it("active offers edit, skip and pause; paused offers resume and change pause", async () => {
    for (const status of ["active", "paused", "cancelled"] as const) {
      vi.mocked(getSubscription).mockResolvedValue(fixtures[status]());
      const { result, unmount } = renderHook(useSubscriptionCard);
      await waitFor(() => expect(result.current.kind).toBe("ready"));
      if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
      expect(result.current.actions.map(({ key }) => key)).toEqual(
        status === "active"
          ? ["edit", "skip", "pause"]
          : status === "paused"
            ? ["resume", "changePause"]
            : [],
      );
      unmount();
    }
  });

  it("the skip sheet shows the old date, the date one interval later, and the amount without per-product skips", async () => {
    const snapshot = fixtures.active();
    vi.mocked(getSubscription).mockResolvedValue(snapshot);
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");

    expect(result.current.skipSheet).toMatchObject({
      open: true,
      phase: "confirm",
      oldDate: formatDay(snapshot.nextChargeAt!, new Date()),
      newDate: formatDay(addDays(snapshot.nextChargeAt!, 30), new Date()),
      amount: "$101.87",
    });
  });

  it("a skip success replaces the snapshot and sets the success notice", async () => {
    const snapshot = fixtures.active();
    const nextChargeAt = addDays(snapshot.nextChargeAt!, 30);
    vi.mocked(getSubscription).mockResolvedValue(snapshot);
    vi.mocked(skipNextShipment).mockResolvedValue({ ...snapshot, nextChargeAt });
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    await act(async () => {
      if (result.current.kind === "ready" && result.current.skipSheet) {
        await result.current.skipSheet.onConfirm();
      }
    });
    await waitFor(() =>
      expect(result.current.kind === "ready" && result.current.notice?.title).toBe(
        "Next box skipped",
      ),
    );
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.skipSheet?.open).toBe(false);
    expect(result.current.receipt.footer).toMatchObject({
      kind: "charge",
      label: `Charged ${formatDay(nextChargeAt, new Date())}`,
    });
  });
  it("editing updates the draft receipt and replaces the actions with Save and Cancel", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.actions.map(({ key }) => key)).toEqual(["edit", "skip", "pause"]);

    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.actions.map(({ key }) => key)).toEqual(["save", "cancelEdit"]);
    expect(result.current.receipt.heading).toBe("Editing next box");
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.onQuantityChange(3),
    );
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.footer).toMatchObject({
      kind: "draft",
      label: "New total",
      sublabel: "Currently $101.87",
      totalCents: 14008,
    });
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")).toMatchObject({
      priceCents: null,
      compareAtCents: null,
      edit: {
        skippedNote: "Skipped in the next box only",
        undo: { label: expect.stringContaining("Vitamin D") },
      },
    });
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")?.edit?.skip,
    ).not.toBeNull();
  });

  it("save commits quantities and a whole-box skip clears only the per-product skips", async () => {
    const snapshot = fixtures.active();
    const nextChargeAt = addDays(snapshot.nextChargeAt!, 30);
    vi.mocked(getSubscription).mockResolvedValue(snapshot);
    vi.mocked(skipNextShipment).mockResolvedValue({ ...snapshot, nextChargeAt });
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.onQuantityChange(3),
    );
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.footer).toMatchObject({ kind: "charge", totalCents: 11462 });
    expect(result.current.skipSheet?.amount).toBe("$140.08");

    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    await act(async () => {
      if (result.current.kind === "ready" && result.current.skipSheet) {
        await result.current.skipSheet.onConfirm();
      }
    });
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")?.quantityLabel,
    ).toBe("Qty 3");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.priceCents,
    ).not.toBeNull();
    expect(result.current.receipt.footer).toMatchObject({ kind: "charge", totalCents: 14008 });
    expect(result.current.notice?.body).toContain("$140.08");
  });

  it("a 409 reload keeps quantities and clears skips from the previous box", async () => {
    const snapshot = fixtures.active();
    const fresh = {
      ...snapshot,
      nextChargeAt: addDays(snapshot.nextChargeAt!, 30),
      updatedAt: "2026-12-01T12:00:00.000Z",
    };
    vi.mocked(getSubscription).mockResolvedValueOnce(snapshot).mockResolvedValueOnce(fresh);
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(409, "changed"));
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines
          .find(({ sku }) => sku === "NW-MULTI-30")
          ?.edit?.onQuantityChange(3),
    );
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    await act(async () => {
      if (result.current.kind === "ready" && result.current.skipSheet) {
        await result.current.skipSheet.onConfirm();
      }
    });
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.skipSheet?.phase).toBe("conflict");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")?.quantityLabel,
    ).toBe("Qty 3");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.priceCents,
    ).not.toBeNull();
    expect(result.current.receipt.footer).toMatchObject({ kind: "charge", totalCents: 14008 });
  });
  it("a 409 reload keeps a saved product skip while the box has not moved", async () => {
    const snapshot = fixtures.active();
    const fresh = { ...snapshot, updatedAt: "2026-12-01T12:00:00.000Z" };
    vi.mocked(getSubscription).mockResolvedValueOnce(snapshot).mockResolvedValueOnce(fresh);
    vi.mocked(skipNextShipment).mockRejectedValueOnce(new ApiError(409, "changed"));
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    await act(async () => {
      if (result.current.kind === "ready" && result.current.skipSheet) {
        await result.current.skipSheet.onConfirm();
      }
    });
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.skipSheet?.phase).toBe("conflict");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.priceCents,
    ).toBeNull();
  });

  it("pausing clears the next-box product skip and change pause can become open-ended", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(
      () =>
        result.current.kind === "ready" &&
        result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.edit?.skip?.onClick(),
    );
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    act(() => result.current.kind === "ready" && result.current.actions[2]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.pauseSheet).toMatchObject({
      open: true,
      value: "1m",
      confirmLabel: "Pause for 1 month",
    });
    act(() => result.current.kind === "ready" && result.current.pauseSheet.onConfirm());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.status).toBe("paused");
    expect(
      result.current.receipt.lines.find(({ sku }) => sku === "NW-VITD-60")?.skippedNote,
    ).toBeNull();
    expect(result.current.receipt.footer).toMatchObject({
      kind: "note",
      label: "No charges while paused",
      sublabel: expect.stringContaining("$101.87"),
    });
    expect(result.current.actions.map(({ key }) => key)).toEqual(["resume", "changePause"]);

    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.pauseSheet.value).toBe("1m");
    act(() => result.current.kind === "ready" && result.current.pauseSheet.onChange("open"));
    act(() => result.current.kind === "ready" && result.current.pauseSheet.onConfirm());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.heading).toBe("Paused until you resume");
    expect(result.current.receipt.footer).toMatchObject({
      kind: "note",
      sublabel: "Resume any time to restart your boxes",
    });
  });

  it("resuming the paused fixture skips locally without calling the API", async () => {
    vi.mocked(getSubscription).mockResolvedValue(fixtures.paused());
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.pauseSheet).toMatchObject({
      open: true,
      value: "",
      confirmDisabled: true,
    });
    act(() => result.current.kind === "ready" && result.current.pauseSheet.onClose());
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.status).toBe("active");
    expect(result.current.notice).toMatchObject({ title: "Subscription resumed" });
    const chargeLabel = result.current.receipt.footer.label;
    expect(chargeLabel).toContain("Charged ");

    act(() => result.current.kind === "ready" && result.current.actions[1]?.onClick());
    if (result.current.kind !== "ready" || !result.current.skipSheet) {
      throw new Error("Expected an open skip sheet");
    }
    const newDate = result.current.skipSheet.newDate;
    await act(async () => {
      if (result.current.kind === "ready") await result.current.skipSheet?.onConfirm();
    });
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.skipSheet?.open).toBe(false);
    expect(result.current.receipt.footer).toMatchObject({
      kind: "charge",
      label: `Charged ${newDate}`,
      totalCents: 10187,
    });
    expect(result.current.notice).toMatchObject({
      tone: "success",
      title: "Next box skipped",
      body: expect.stringContaining(`$101.87 on ${newDate}`),
    });
    expect(skipNextShipment).not.toHaveBeenCalled();
  });

  it("resuming after a pause keeps the original next charge date", async () => {
    const snapshot = fixtures.active();
    vi.mocked(getSubscription).mockResolvedValue(snapshot);
    const { result } = renderHook(useSubscriptionCard);
    await waitFor(() => expect(result.current.kind).toBe("ready"));
    act(() => result.current.kind === "ready" && result.current.actions[2]?.onClick());
    act(() => result.current.kind === "ready" && result.current.pauseSheet.onConfirm());
    act(() => result.current.kind === "ready" && result.current.actions[0]?.onClick());
    if (result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    expect(result.current.receipt.status).toBe("active");
    expect(result.current.receipt.footer.label).toBe(
      `Charged ${formatDay(snapshot.nextChargeAt!, new Date())}`,
    );
  });
});
