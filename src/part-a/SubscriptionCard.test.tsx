import { fixtures } from "@/api/fixtures";
import { getSubscription } from "@/api/mockApi";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SubscriptionCard } from "./SubscriptionCard";
import { addDays, formatDay } from "./logic/dates";

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
  expect(within(sheet).getAllByRole("radio")).toHaveLength(4);
  fireEvent.click(within(sheet).getByRole("radio", { name: /Until I resume/ }));
  const confirm = within(sheet).getByRole("button", { name: "Pause until I resume" });
  expect(confirm).toBeEnabled();
  fireEvent.click(confirm);

  expect(screen.getByRole("heading", { name: "Paused until you resume" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Resume now" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Edit products" })).not.toBeInTheDocument();
});

it("cancels without choosing a reason and returns directly to the receipt", async () => {
  window.scrollTo = vi.fn();
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);

  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  const confirmHeading = screen.getByRole("heading", { level: 1, name: "Before you cancel" });
  expect(confirmHeading).toHaveFocus();
  expect(screen.queryByRole("heading", { name: "Manage" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
  expect(screen.getByRole("heading", { name: /^Cancelled on / })).toHaveFocus();
  expect(screen.getByText(/^Cancelled on /)).toBeInTheDocument();
  expect(screen.getByText("No more charges")).toBeInTheDocument();
  expect(screen.getByText("You won't be charged again.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Cancel subscription" })).not.toBeInTheDocument();
});

it("shows the moved date in the skip alternative", async () => {
  window.scrollTo = vi.fn();
  const snapshot = fixtures.active();
  vi.mocked(getSubscription).mockResolvedValue(snapshot);
  render(<SubscriptionCard />);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I have too much product left" }));
  expect(screen.getByText(/Move your next charge to/)).toHaveTextContent(
    formatDay(addDays(snapshot.nextChargeAt!, snapshot.intervalDays), new Date()),
  );
});

it("shows a 60-day receipt after accepting the cadence offer, without repeating that offer", async () => {
  window.scrollTo = vi.fn();
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "It costs too much" }));
  fireEvent.click(screen.getByRole("button", { name: "Switch to every 60 days" }));
  expect(screen.getByText("Every 60 days")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "It costs too much" }));
  expect(screen.queryByRole("button", { name: "Switch to every 60 days" })).not.toBeInTheDocument();
});

it("offers the product list without suggesting a replacement", async () => {
  window.scrollTo = vi.fn();
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I'm trying a different product" }));

  expect(screen.queryByRole("radio", { name: "Magnesium, 90 capsules" })).not.toBeInTheDocument();
  const browse = screen.getByRole("button", { name: "Browse products" });
  fireEvent.click(browse);
  expect(screen.getByRole("heading", { name: "Before you cancel" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Browse products" })).toBeInTheDocument();
});

it("restores focus after dismissing an offer handoff sheet", async () => {
  window.scrollTo = vi.fn();
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I have too much product left" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip my next box" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep my box" }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "My subscription" })).toHaveFocus(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I didn't see results" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause instead" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep it active" }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "My subscription" })).toHaveFocus(),
  );
});

it("restores focus after confirming locally simulated skip and pause offers", async () => {
  window.scrollTo = vi.fn();
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "It costs too much" }));
  fireEvent.click(screen.getByRole("button", { name: "Switch to every 60 days" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I have too much product left" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip my next box" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip this box" }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "My subscription" })).toHaveFocus(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
  fireEvent.click(screen.getByRole("radio", { name: "I didn't see results" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause instead" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause for 1 month" }));
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "My subscription" })).toHaveFocus(),
  );
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

it("moves focus to the receipt heading after pausing and after resuming", async () => {
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);

  fireEvent.click(await screen.findByRole("button", { name: "Pause subscription" }));
  const sheet = screen.getByRole("dialog", { name: "Pause your subscription" });
  fireEvent.click(within(sheet).getByRole("button", { name: "Pause for 1 month" }));
  expect(screen.getByRole("heading", { name: /^Paused until/ })).toHaveFocus();

  fireEvent.click(screen.getByRole("button", { name: "Resume now" }));
  expect(screen.getByRole("heading", { name: "Next box" })).toHaveFocus();
});

it("dismisses the notice and moves focus to the receipt heading", async () => {
  vi.mocked(getSubscription).mockResolvedValue(fixtures.active());
  render(<SubscriptionCard />);

  fireEvent.click(await screen.findByRole("button", { name: "Pause subscription" }));
  const sheet = screen.getByRole("dialog", { name: "Pause your subscription" });
  fireEvent.click(within(sheet).getByRole("button", { name: "Pause for 1 month" }));
  const dismiss = screen.getByRole("button", { name: "Dismiss message" });
  dismiss.focus();
  fireEvent.click(dismiss);

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /^Paused until/ })).toHaveFocus();
});
