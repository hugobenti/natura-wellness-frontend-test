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
};

/** Original price under the price, right-aligned. Assistive tech reads "Was $29.95". */
export const Stacked: TStory = {
  args: { compareAtCents: 2995, layout: "stacked" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Was $29.95")).toBeInTheDocument();
    await expect(within(canvasElement).getByText("$25.46")).toBeInTheDocument();
  },
};

/** The large size, for a product page. */
export const Large: TStory = {
  args: { compareAtCents: 2995, size: "lg" },
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
