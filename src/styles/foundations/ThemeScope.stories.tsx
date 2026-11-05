import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

// Fixture theme: reuses an existing primitive and a generic font, so nothing here is a raw color.
const scopeCheckStyle =
  '[data-theme="scope-check"] { --color-fg: var(--brand-brown-700); --font-sans: monospace; }';

const meta = {
  title: "Foundations/Theme scope",
  tags: ["!dev", "!autodocs"],
} satisfies Meta;

export default meta;

type TStory = StoryObj<typeof meta>;

/** A `data-theme` wrapper re-scopes the semantic tokens for its subtree, text color and font included. */
export const ScopesTextColorAndFont: TStory = {
  render: () => (
    <>
      <style>{scopeCheckStyle}</style>
      <p data-testid="outer">Outside the scope</p>
      <div data-theme="scope-check">
        <p data-testid="inner">Inside the scope</p>
      </div>
      <span data-testid="reference" style={{ color: "var(--brand-brown-700)" }} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outer = getComputedStyle(canvas.getByTestId("outer"));
    const inner = getComputedStyle(canvas.getByTestId("inner"));
    const reference = getComputedStyle(canvas.getByTestId("reference"));

    await expect(inner.color).toBe(reference.color);
    await expect(inner.color).not.toBe(outer.color);
    await expect(inner.fontFamily).toContain("monospace");
  },
};
