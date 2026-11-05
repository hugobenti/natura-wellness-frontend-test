import { getSubscription } from "@/api/mockApi";
import { render, screen, within } from "@testing-library/react";
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
