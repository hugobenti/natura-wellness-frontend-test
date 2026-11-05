import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";
import { badge } from "./Badge.style";
import { badgeStory } from "./Badge.stories.style";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { tone: "active", children: "Active" },
} satisfies Meta<typeof Badge>;

export default meta;
type TStory = StoryObj<typeof meta>;

const toneLabel = {
  highlight: "Best value",
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  danger: "Payment failed",
} as const satisfies Record<keyof typeof badge.tone, string>;

const tones = Object.keys(badge.tone) as Array<keyof typeof badge.tone>;

/** Every tone, text only. */
export const Tones: TStory = {
  render: () => (
    <div className={badgeStory.row}>
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>
          {toneLabel[tone]}
        </Badge>
      ))}
    </div>
  ),
};

/** Every tone with a decorative icon next to the word. */
export const WithIcon: TStory = {
  render: () => (
    <div className={badgeStory.row}>
      <Badge tone="active" icon="check-circle">
        Active
      </Badge>
      <Badge tone="paused" icon="pause">
        Paused
      </Badge>
      <Badge tone="cancelled" icon="x-circle">
        Cancelled
      </Badge>
      <Badge tone="danger" icon="alert-triangle">
        Payment failed
      </Badge>
      <Badge tone="highlight" icon="info">
        Best value
      </Badge>
    </div>
  ),
};

/** The copy stays sentence case; `highlight` renders it in capitals. */
export const HighlightUppercase: TStory = {
  args: { tone: "highlight", children: "Best value" },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText("Best value");

    await expect(getComputedStyle(label).textTransform).toBe("uppercase");
  },
};
