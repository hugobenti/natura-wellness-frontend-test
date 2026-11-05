import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFormField } from "./useFormField";

describe("useFormField", () => {
  it("describes the control with its hint and error", () => {
    const { result } = renderHook(() => useFormField({ hint: "A hint", error: "An error" }));

    expect(result.current.describedBy).toBe(`${result.current.hintId} ${result.current.errorId}`);
    expect(result.current.invalid).toBe(true);
  });

  it("has no description and is valid with neither", () => {
    const { result } = renderHook(() => useFormField({}));

    expect(result.current.describedBy).toBeUndefined();
    expect(result.current.invalid).toBeUndefined();
  });

  it("describes only the hint when there is no error", () => {
    const { result } = renderHook(() => useFormField({ hint: "A hint" }));

    expect(result.current.describedBy).toBe(result.current.hintId);
    expect(result.current.invalid).toBeUndefined();
  });
});
