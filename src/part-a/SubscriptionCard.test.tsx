import { getSubscription } from "@/api/mockApi";
import { fixtures } from "@/api/fixtures";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { SubscriptionCard } from "./SubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
});

it("offers retry before contact support in the load error", async () => {
  vi.mocked(getSubscription).mockRejectedValue(new Error("offline"));
  render(<SubscriptionCard />);

  const alert = await screen.findByRole("alert");
  const retry = within(alert).getByRole("button", { name: "Try again" });
  const support = within(alert).getByRole("link", { name: "Contact support" });
  expect(retry.compareDocumentPosition(support) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("moves focus to the page heading when retrying a failed load", async () => {
  vi.mocked(getSubscription)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);

  fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
  expect(screen.getByRole("heading", { level: 1, name: "My subscription" })).toHaveFocus();
  await screen.findByRole("heading", { name: "Next box" });
});
