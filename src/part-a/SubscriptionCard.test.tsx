import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SubscriptionCard } from "./SubscriptionCard";

vi.mock("@/api/mockApi", () => ({ getSubscription: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSubscription).mockReset();
});

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
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
  fireEvent.click(screen.getByRole("button", { name: "Skip once: Vitamin D, 60 softgels" }));
  const skippedNote = screen.getByText("Skipped in the next box only");
  expect(screen.queryByText("$25.46")).not.toBeInTheDocument();
  const undo = screen.getByRole("button", { name: "Undo skipping Vitamin D, 60 softgels" });
  expect(skippedNote.parentElement).toContainElement(undo);
  expect(screen.getByRole("button", { name: "Skip once: Multivitamin, 30 tablets" })).toBeEnabled();
  expect(screen.getByText("New total")).toBeInTheDocument();
  expect(screen.getByText("Currently $101.87")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("button", { name: "Edit products" })).toHaveFocus();
  expect(screen.getByText("$25.46")).toBeInTheDocument();
});

it("requires a radio selection when changing a server pause and offers an open-ended pause", async () => {
  vi.mocked(getSubscription).mockResolvedValue(fixtures.paused());
  render(<SubscriptionCard />);

  fireEvent.click(await screen.findByRole("button", { name: "Change pause" }));
  const sheet = screen.getByRole("dialog", { name: "Change your pause" });
  expect(within(sheet).getByRole("button", { name: "Choose a duration" })).toBeDisabled();
  expect(within(sheet).getByRole("group", { name: "How long?" })).toHaveClass("mt-4");
  expect(within(sheet).getAllByRole("radio")).toHaveLength(4);
  fireEvent.click(within(sheet).getByRole("radio", { name: /Until I resume/ }));
  const confirm = within(sheet).getByRole("button", { name: "Pause until I resume" });
  expect(confirm).toBeEnabled();
  fireEvent.click(confirm);

  expect(screen.getByRole("heading", { name: "Paused until you resume" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Resume now" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Edit products" })).not.toBeInTheDocument();
});
