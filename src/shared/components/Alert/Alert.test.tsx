import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
