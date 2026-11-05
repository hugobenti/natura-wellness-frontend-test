import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { PriceDisplay } from "./PriceDisplay";

const meta = {
  title: "Components/PriceDisplay",
  component: PriceDisplay,
  args: { amountCents: 2546 },
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Price and original price side by side. */
export const Inline: TStory = {
  args: { compareAtCents: 2995 },
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByText("$25.46").parentElement as HTMLElement;
    await expect(getComputedStyle(row).rowGap).toBe("8px");
    await expect(getComputedStyle(row).flexDirection).toBe("row");
  },
};

/** Original price under the price, right-aligned. Assistive tech reads "Was $29.95". */
export const Stacked: TStory = {
  args: { compareAtCents: 2995, layout: "stacked" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Was $29.95")).toBeInTheDocument();
    const row = within(canvasElement).getByText("$25.46").parentElement as HTMLElement;
    await expect(getComputedStyle(row).rowGap).toBe("0px");
    await expect(getComputedStyle(row).flexDirection).toBe("column");
  },
};

/** The large size, for a product page. */
export const Large: TStory = {
  args: { compareAtCents: 2995, size: "lg" },
  play: async ({ canvasElement }) => {
    const price = within(canvasElement).getByText("$25.46");
    const compareAt = within(canvasElement).getByText("$29.95");
    await expect(getComputedStyle(compareAt).fontWeight).toBe("400");
    await expect(parseFloat(getComputedStyle(compareAt).fontSize)).toBeLessThan(
      parseFloat(getComputedStyle(price).fontSize),
    );
  },
};

/** No original price: just the price. */
export const NoDiscount: TStory = {};

/** An original price that is not higher than the price is not shown. */
export const CompareAtNotHigher: TStory = {
  args: { compareAtCents: 2546 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/Was/)).toBeNull();
  },
};
