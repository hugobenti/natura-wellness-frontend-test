import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { statusBadgeContent } from "@/content/components/statusBadge";
import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  args: { status: "active" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** An active subscription. */
export const Active: TStory = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(statusBadgeContent.label.active)).toBeVisible();
  },
};

/** A paused subscription. */
export const Paused: TStory = { args: { status: "paused" } };

/** A cancelled subscription. */
export const Cancelled: TStory = { args: { status: "cancelled" } };
