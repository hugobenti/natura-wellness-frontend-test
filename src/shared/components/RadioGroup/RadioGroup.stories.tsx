import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Select } from "../Select/Select";
import { RadioGroup } from "./RadioGroup";
import { radioGroupStory } from "./RadioGroup.stories.style";
import type { IRadioGroupProps, IRadioOption } from "./RadioGroup.type";

type TDemoProps = Omit<IRadioGroupProps<string>, "value"> & { initial: string };

function Demo({ initial, onChange, ...props }: TDemoProps) {
  const [value, setValue] = useState(initial);

  return (
    <div className={radioGroupStory.frame}>
      <RadioGroup
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

function DeliveryPanel() {
  const [days, setDays] = useState("30");

  return (
    <Select
      label="Delivered every"
      layout="inline"
      value={days}
      onChange={setDays}
      options={[
        { value: "30", label: "30 days" },
        { value: "60", label: "60 days" },
        { value: "90", label: "90 days" },
      ]}
    />
  );
}

const reasons: Array<IRadioOption> = [
  { value: "price", label: "It costs too much", trailing: "38%" },
  { value: "stock", label: "I have too much product", trailing: "24%" },
  { value: "results", label: "I did not see results", trailing: "15%" },
  { value: "switch", label: "I switched to another brand", trailing: "12%" },
  { value: "other", label: "Another reason", trailing: "11%" },
];

const purchaseOptions: Array<IRadioOption> = [
  {
    value: "once",
    label: "One-time purchase",
    trailing: <span className={radioGroupStory.price}>$29.95</span>,
  },
  {
    value: "subscribe",
    label: "Subscribe & save 15%",
    badge: <span className={radioGroupStory.bestValue}>Best value</span>,
    trailing: (
      <span className={radioGroupStory.prices}>
        <span className={radioGroupStory.price}>$25.46</span>
        <span className={radioGroupStory.oldPrice}>$29.95</span>
      </span>
    ),
    panel: <DeliveryPanel />,
  },
];

const meta = {
  title: "Components/RadioGroup",
  component: Demo,
  args: {
    legend: "Why are you cancelling?",
    name: "reason",
    initial: "price",
    options: reasons,
    onChange: fn(),
  },
} satisfies Meta<typeof Demo>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Plain list of radios, each with a trailing share. */
export const List: TStory = {};

/** Cards: the selected one gets an accent frame and its nested panel. */
export const Cards: TStory = {
  args: {
    appearance: "card",
    legend: "How do you want to buy?",
    name: "purchase",
    initial: "subscribe",
    options: purchaseOptions,
  },
};

/** Arrow keys move the selection between native radios. */
export const KeyboardSelection: TStory = {
  args: { name: "reason-keyboard" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("radio", { name: /costs too much/ });

    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");

    const second = canvas.getByRole("radio", { name: /too much product/ });
    await expect(second).toBeChecked();
    await expect(first).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenCalledWith("stock");
  },
};

/** The panel exists only for the selected option, and its controls do not change the selection. */
export const PanelOnlyForSelected: TStory = {
  args: {
    appearance: "card",
    legend: "How do you want to buy?",
    name: "purchase-panel",
    initial: "once",
    options: purchaseOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByLabelText("Delivered every")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("radio", { name: /Subscribe/ }));

    const select = canvas.getByLabelText("Delivered every");
    await expect(
      canvas.getByRole("radio", { name: /Subscribe/ }).closest("label"),
    ).not.toContainElement(select);
    await userEvent.tab();
    await expect(select).toHaveFocus();
    await userEvent.selectOptions(select, "90");
    await expect(select).toHaveValue("90");
    await expect(canvas.getByRole("radio", { name: /Subscribe/ })).toBeChecked();
  },
};

/** The whole card is the label: a click 4px inside its top-left corner selects it. */
export const CardEdgeClick: TStory = {
  args: {
    appearance: "card",
    legend: "How do you want to buy?",
    name: "purchase-edge",
    initial: "once",
    options: purchaseOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("radio", { name: /Subscribe/ }).closest("label")!.parentElement!;
    const rect = card.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + 4, rect.top + 4);

    await expect(hit).not.toBeNull();
    await userEvent.click(hit!);
    await expect(canvas.getByRole("radio", { name: /Subscribe/ })).toBeChecked();
  },
};
