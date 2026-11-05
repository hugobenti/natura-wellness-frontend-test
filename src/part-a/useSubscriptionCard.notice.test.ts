import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscriptionCard } from "./useSubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn(), skipNextShipment: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
  window.scrollTo = vi.fn();
});

/** An active subscription showing the "Changes saved" notice. */
async function setupWithNotice() {
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  const hook = renderHook(useSubscriptionCard);
  await waitFor(() => expect(hook.result.current.kind).toBe("ready"));
  const ready = () => {
    if (hook.result.current.kind !== "ready") throw new Error("Expected a ready receipt");
    return hook.result.current;
  };
  act(() =>
    ready()
      .actions.find(({ key }) => key === "edit")
      ?.onClick(),
  );
  act(() =>
    ready()
      .receipt.lines.find(({ sku }) => sku === "NW-MULTI-30")
      ?.edit?.onQuantityChange(3),
  );
  act(() =>
    ready()
      .actions.find(({ key }) => key === "save")
      ?.onClick(),
  );
  expect(ready().notice).not.toBeNull();
  return { ...hook, ready };
}

describe("useSubscriptionCard notices", () => {
  it("starting to edit clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "edit")
        ?.onClick(),
    );
    expect(ready().notice).toBeNull();
  });

  it("opening the skip sheet clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "skip")
        ?.onClick(),
    );
    expect(ready().skipSheet?.open).toBe(true);
    expect(ready().notice).toBeNull();
  });

  it("opening the pause sheet clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "pause")
        ?.onClick(),
    );
    expect(ready().pauseSheet.open).toBe(true);
    expect(ready().notice).toBeNull();
  });

  it("opening the change-pause sheet clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "pause")
        ?.onClick(),
    );
    act(() => ready().pauseSheet.onConfirm());
    expect(ready().notice).not.toBeNull();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "changePause")
        ?.onClick(),
    );
    expect(ready().pauseSheet.open).toBe(true);
    expect(ready().notice).toBeNull();
  });

  it("opening Before you cancel clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "cancel")
        ?.onClick(),
    );
    expect(ready().pageView).toBe("cancelConfirm");
    expect(ready().notice).toBeNull();
  });

  it("Edit my next box from the cancel view clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "cancel")
        ?.onClick(),
    );
    act(() => ready().confirm.editLink?.onClick());
    expect(ready().pageView).toBe("subscription");
    expect(ready().notice).toBeNull();
  });

  it("the cancel flow's own outcome still sets its notice", async () => {
    const { ready } = await setupWithNotice();
    act(() =>
      ready()
        .actions.find(({ key }) => key === "cancel")
        ?.onClick(),
    );
    act(() => ready().confirm.onCancel());
    expect(ready().pageView).toBe("survey");
    expect(ready().notice).toBeNull();
    act(() => ready().survey.onSkip());
    expect(ready().pageView).toBe("subscription");
    expect(ready().notice).toMatchObject({ tone: "success" });
  });

  it("dismissNotice clears the notice", async () => {
    const { ready } = await setupWithNotice();
    act(() => ready().dismissNotice());
    expect(ready().notice).toBeNull();
  });
});
