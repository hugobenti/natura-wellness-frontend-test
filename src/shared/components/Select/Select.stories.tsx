import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Select } from "./Select";
import { selectStory } from "./Select.stories.style";
import type { ISelectProps } from "./Select.type";

type TDemoProps = Omit<ISelectProps<string>, "value"> & { initial: string };

function Demo({ initial, onChange, ...props }: TDemoProps) {
  const [value, setValue] = useState(initial);

  return (
    <div className={selectStory.frame}>
      <Select
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    </div>
  );
}

const meta = {
  title: "Components/Select",
  component: Demo,
  args: {
    label: "Delivered every",
    initial: "30",
    onChange: fn(),
    options: [
      { value: "30", label: "30 days" },
      { value: "60", label: "60 days" },
      { value: "90", label: "90 days" },
    ],
  },
} satisfies Meta<typeof Demo>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Label above the select; choosing an option reports its value. */
export const Stacked: TStory = {
  play: async ({ canvasElement, args }) => {
    const select = within(canvasElement).getByLabelText("Delivered every");

    await expect(select.tagName).toBe("SELECT");
    await userEvent.selectOptions(select, "60 days");
    await expect(args.onChange).toHaveBeenCalledWith("60");
    await expect(select).toHaveValue("60");
  },
};

/** Label and select in a row. */
export const Inline: TStory = { args: { layout: "inline" } };

/** An error is announced with the select and marks it invalid. */
export const WithError: TStory = {
  args: { error: "Choose how often to deliver." },
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText("Delivered every");

    await expect(select).toHaveAttribute("aria-invalid", "true");
    await expect(select).toHaveAccessibleDescription("Choose how often to deliver.");
  },
};
