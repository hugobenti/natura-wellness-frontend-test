import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Icon } from "@/shared/icons/Icon";
import { Button } from "./Button";
import { button } from "./Button.style";
import { buttonStory } from "./Button.stories.style";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes" },
} satisfies Meta<typeof Button>;

export default meta;
type TStory = StoryObj<typeof meta>;

const variants = Object.keys(button.variant) as Array<keyof typeof button.variant>;
const sizes = Object.keys(button.size).filter((size) => size !== "icon") as Array<
  keyof typeof button.size
>;

/** The default action: one per view. */
export const Primary: TStory = {};

/** Every variant side by side. */
export const Variants: TStory = {
  render: (args) => (
    <div className={buttonStory.row}>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** Text sizes; `icon` is shown separately. */
export const Sizes: TStory = {
  render: (args) => (
    <div className={buttonStory.row}>
      {sizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

/** Fills its container, for the mobile layout. */
export const FullWidth: TStory = {
  args: { fullWidth: true },
  render: (args) => (
    <div className={buttonStory.stack}>
      <Button {...args} />
      <Button {...args} variant="secondary" />
    </div>
  ),
};

/** Natively disabled: greyed out and out of the tab order. */
export const Disabled: TStory = {
  args: { disabled: true },
  render: (args) => (
    <div className={buttonStory.row}>
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

/** An icon-only button gets its name from `aria-label`. */
export const IconOnly: TStory = {
  args: { size: "icon", variant: "secondary", "aria-label": "Close", children: undefined },
  render: (args) => (
    <Button {...args}>
      <Icon name="close" />
    </Button>
  ),
};

/** A pending button keeps its label and focus, and ignores mouse, Enter and Space. */
export const PendingIgnoresRepeat: TStory = {
  args: { pending: true, onClick: fn(), children: "Saving" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("button", { name: "Saving" });

    await userEvent.click(control);
    control.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: "Saving" })).toBe(control);
    await expect(control).toHaveAttribute("aria-busy", "true");
    await expect(document.activeElement).toBe(control);
  },
};
