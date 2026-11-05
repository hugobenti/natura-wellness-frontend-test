import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("announces errors assertively and successes politely", () => {
    render(
      <>
        <Alert tone="danger" title="Payment failed" />
        <Alert tone="success" title="Saved" />
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("has no dismiss button without onDismiss", () => {
    render(<Alert tone="info" title="Saved" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDismiss from the dismiss button", () => {
    const onDismiss = vi.fn();
    render(<Alert tone="info" title="Saved" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
