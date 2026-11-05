import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
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

it("edits the receipt, hides a skipped price and restores focus after cancelling", async () => {
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);

  const edit = await screen.findByRole("button", { name: "Edit products" });
  fireEvent.click(edit);
  const heading = screen.getByRole("heading", { name: "Editing next box" });
  expect(heading).toHaveFocus();
  expect(
    screen.getByRole("group", { name: "Quantity of Vitamin D, 60 softgels" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Skip Vitamin D, 60 softgels once" }));
  const skippedNote = screen.getByText("Skipped in the next box only");
  expect(screen.queryByText("$25.46")).not.toBeInTheDocument();
  const undo = screen.getByRole("button", { name: "Undo skipping Vitamin D, 60 softgels" });
  expect(skippedNote.parentElement).toContainElement(undo);
  expect(undo.closest(".opacity-60")).toBeNull();
  expect(screen.getByText("To skip everything, use Skip the whole box")).toBeInTheDocument();
  expect(screen.getByText("New total")).toBeInTheDocument();
  expect(screen.getByText("Currently $101.87")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("button", { name: "Edit products" })).toHaveFocus();
  expect(screen.getByText("$25.46")).toBeInTheDocument();
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
