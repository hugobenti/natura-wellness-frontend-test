import type { Decorator, Preview } from "@storybook/react-vite";

import "../src/styles/globals.css";
import { themeNames } from "../src/styles/themes";
import { storyCanvas } from "./preview.style";

/** Renders every story on the Storybook canvas, inside the theme picked in the toolbar. */
const withTheme: Decorator = (Story, context) => (
  <div data-theme={context.globals.theme} className={storyCanvas}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: "brand" },
  globalTypes: {
    theme: {
      description: "Theme applied to the story",
      toolbar: { title: "Theme", icon: "paintbrush", items: [...themeNames], dynamicTitle: true },
    },
  },
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    controls: { expanded: true },
    options: {
      storySort: { order: ["Foundations", ["Introduction"], "Components", ["Overview", "*"]] },
    },
  },
};

export default preview;
