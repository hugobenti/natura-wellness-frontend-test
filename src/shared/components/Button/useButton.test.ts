import { renderHook } from "@testing-library/react";
import type { MouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useButton } from "./useButton";

function fakeEvent() {
  return { preventDefault: vi.fn() } as unknown as MouseEvent<HTMLButtonElement>;
}

describe("useButton", () => {
  it("ignores clicks while pending", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useButton({ pending: true, onClick }));
    const event = fakeEvent();

    result.current.onClick(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
    expect(result.current["aria-disabled"]).toBe(true);
    expect(result.current["aria-busy"]).toBe(true);
  });

  it("forwards clicks when not pending", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useButton({ pending: false, onClick }));
    const event = fakeEvent();

    result.current.onClick(event);

    expect(onClick).toHaveBeenCalledWith(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current["aria-disabled"]).toBeUndefined();
    expect(result.current["aria-busy"]).toBeUndefined();
  });
});
