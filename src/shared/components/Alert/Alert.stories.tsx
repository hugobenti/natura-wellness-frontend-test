import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: { tone: "info", title: "Your next box ships on 12 June." },
} satisfies Meta<typeof Alert>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** A success is announced politely, as a `status`. */
export const Success: TStory = {
  args: { tone: "success", title: "Your subscription was updated." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toBeVisible();
  },
};

/** Neutral information, also a `status`. */
export const Info: TStory = {
  args: {
    tone: "info",
    title: "Your next box ships on 12 June.",
    children: "Changes made before then apply to that box.",
  },
};

/** An error is announced assertively, as an `alert`, with a quiet action next to it. */
export const Danger: TStory = {
  args: {
    tone: "danger",
    title: "Your subscription changed elsewhere. We reloaded it; check and try again.",
    action: <Button variant="quiet">Reload</Button>,
  },
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");

    await expect(within(alert).getByRole("button", { name: "Reload" })).toBeVisible();
  },
};

/** A close button in the top-right corner, for page-level outcome notices. */
export const Dismissible: TStory = {
  args: {
    tone: "success",
    title: "Changes saved",
    children: "We'll charge $101.87 on 12 June for your next box.",
    onDismiss: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Dismiss message" }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
