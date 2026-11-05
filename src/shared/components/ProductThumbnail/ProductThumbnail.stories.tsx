import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { ProductThumbnail } from "./ProductThumbnail";
import { productThumbnail } from "./ProductThumbnail.style";
import { productThumbnailStory } from "./ProductThumbnail.stories.style";

const meta = {
  title: "Components/ProductThumbnail",
  component: ProductThumbnail,
  args: { src: "/product.jpg", name: "Magnesium glycinate" },
} satisfies Meta<typeof ProductThumbnail>;

export default meta;
type TStory = StoryObj<typeof meta>;

const sizes = Object.keys(productThumbnail.size) as Array<keyof typeof productThumbnail.size>;

/** The product image at the default size. */
export const WithImage: TStory = {
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("img")?.naturalWidth).toBeGreaterThan(0),
    );
  },
};

/** Every size, with an image and with the fallback tile. */
export const Sizes: TStory = {
  render: (args) => (
    <div className={productThumbnailStory.row}>
      {sizes.map((size) => (
        <ProductThumbnail key={size} {...args} size={size} />
      ))}
      {sizes.map((size) => (
        <ProductThumbnail key={`${size}-tile`} {...args} src={null} size={size} />
      ))}
    </div>
  ),
};

/** No image: a tile with the initial, named for assistive tech. */
export const NoImage: TStory = {
  args: { src: null },
  play: async ({ args, canvasElement }) => {
    const tile = within(canvasElement).getByRole("img", { name: args.name });
    await expect(tile).toHaveTextContent("M");
  },
};

/** An image that fails to load is replaced by the tile, never a broken-image icon. */
export const BrokenImage: TStory = {
  args: { src: "/missing.jpg" },
  play: async ({ args, canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector("img")).toBeNull());
    const tile = within(canvasElement).getByRole("img", { name: args.name });
    await expect(tile).toHaveTextContent("M");
  },
};

/** Next to the product name the thumbnail is decorative and hidden from assistive tech. */
export const Decorative: TStory = {
  args: { decorative: true },
  render: (args) => (
    <div className={productThumbnailStory.row}>
      <ProductThumbnail {...args} />
      <ProductThumbnail {...args} src={null} />
    </div>
  ),
};
