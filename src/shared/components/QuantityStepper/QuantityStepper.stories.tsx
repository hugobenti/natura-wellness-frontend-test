import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { QuantityStepper } from "./QuantityStepper";
import { quantityStepperStory } from "./QuantityStepper.stories.style";
import type { IQuantityStepperProps } from "./QuantityStepper.type";

/** Story-local parent: it owns the quantity, as a real screen would. */
function Demo({ value: initial, onChange, ...rest }: IQuantityStepperProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className={quantityStepperStory.frame}>
      <QuantityStepper
        {...rest}
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    </div>
  );
}

const meta = {
  title: "Components/QuantityStepper",
  component: QuantityStepper,
  args: { value: 2, onChange: fn(), label: "Quantity" },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

/** Part B's look: no visible label, just − 1 + in a bordered box. */
export const LabelHidden: TStory = {
  args: { value: 1, labelHidden: true, label: "Quantity for Daily Greens" },
};

/** Both buttons disable at their bound, and focus stays on a usable button. */
export const Bounds: TStory = {
  args: { value: 9, max: 10 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const decrease = canvas.getByRole("button", { name: "Decrease quantity" });
    const increase = canvas.getByRole("button", { name: "Increase quantity" });
    const output = canvasElement.querySelector("output");

    await userEvent.click(increase);
    await expect(output).toHaveTextContent("10");
    await expect(increase).toBeDisabled();
    await expect(decrease).toHaveFocus();

    for (let i = 0; i < 9; i += 1) await userEvent.click(decrease);
    await expect(output).toHaveTextContent("1");
    await expect(decrease).toBeDisabled();
    await expect(increase).toHaveFocus();

    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls;
    await expect(Math.min(...calls.map(([next]) => next as number))).toBeGreaterThanOrEqual(1);
  },
};
