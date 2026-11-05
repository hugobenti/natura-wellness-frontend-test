import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SkipSheet } from "./SkipSheet";
import type { ISkipSheetProps } from "./SkipSheet.type";

const base: ISkipSheetProps = {
  open: false,
  phase: "confirm",
  oldDate: "Wed, Nov 11",
  newDate: "Fri, Dec 11",
  amount: "$101.87",
  confirmLabel: "Skip this box",
  chargeLabel: "Charged on Fri, Dec 11",
  nothingNote: "Nothing is sent or charged on Wed, Nov 11.",
  errorBody: "Nothing changed: you'll still be charged on Wed, Nov 11.",
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe("SkipSheet", () => {
  it.each(["conflict", "error"] as const)(
    "places the %s alert before the latest box facts",
    (phase) => {
      const { container } = render(<SkipSheet {...base} phase={phase} />);
      const dialog = container.querySelector("dialog");
      const notice = dialog?.querySelector(
        phase === "error" ? '[role="alert"]' : '[role="status"]',
      );
      const facts = dialog?.querySelector("dl");

      expect(notice).not.toBeNull();
      expect(facts).not.toBeNull();
      expect(
        notice!.compareDocumentPosition(facts!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );

  it("disables Keep my box while skipping but keeps the pending primary button focusable", () => {
    render(<SkipSheet {...base} phase="pending" confirmLabel="Skipping…" />);

    expect(screen.getByRole("button", { name: "Keep my box", hidden: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Skipping…", hidden: true })).not.toBeDisabled();
  });

  it("reads the box move as from the old date to the new one", () => {
    const { container } = render(<SkipSheet {...base} />);
    const dates = container.querySelector("dl dd")!.cloneNode(true) as HTMLElement;
    dates.querySelectorAll("[aria-hidden='true']").forEach((node) => node.remove());

    expect(dates.textContent).toBe("from Wed, Nov 11 to Fri, Dec 11");
  });
});
