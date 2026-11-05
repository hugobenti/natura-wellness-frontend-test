import type { Meta, StoryObj } from "@storybook/react-vite";
import { foundation as f } from "@/styles/foundations/foundations.style";
import { Icon } from "./Icon";
import { iconPaths } from "./Icon.data";
import { iconStory } from "./Icon.stories.style";
import type { TIconName } from "./Icon.type";

const names = Object.keys(iconPaths) as TIconName[];

const meta = { title: "Components/Icon", component: Icon } satisfies Meta<typeof Icon>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Every icon with its name. */
export const Gallery: TStory = {
  args: { name: "check" },
  render: () => (
    <ul className={f.grid}>
      {names.map((name) => (
        <li key={name} className={f.card}>
          <Icon name={name} className={iconStory.galleryIcon} />
          <span className={f.name}>{name}</span>
        </li>
      ))}
    </ul>
  ),
};

/** The icon takes the color of the surrounding text. */
export const InheritsColor: TStory = {
  args: { name: "alert-triangle" },
  render: (args) => (
    <span className={iconStory.pill}>
      <Icon {...args} />
      Payment failed
    </span>
  ),
};
